from __future__ import annotations
from faster_whisper import WhisperModel
import json
import math
import re
from dataclasses import dataclass

from pydub import AudioSegment
from pydub.silence import detect_nonsilent

from app.config import get_settings

settings = get_settings()

FILLER_WORDS = [
    "umm",
    "umhm",
    "uh",
    "ahhh"
    "errrr",
    "ah",
    "like",
    "youknow",
    "sortof",
    "kindof",
    "basically",
    "actually",
    "literally",
    "right",
    "okay",
    "so",
]

FILLER_PATTERN = re.compile(
    r"\b(" + "|".join(re.escape(word) for word in sorted(FILLER_WORDS, key=len, reverse=True)) + r")\b",
    re.IGNORECASE,
)


@dataclass
class AnalysisResult:
    transcript: str
    filler_count: int
    filler_word_breakdown: dict[str, int]
    speaking_rate: float
    pause_count: int
    pauses: list[dict[str, float]]
    word_timestamps: list[dict[str, float | str]]
    feedback: str
    overall_score: int
    duration_seconds: float


class ProcessingService:
    @staticmethod
    def get_audio_duration_seconds(file_path: str) -> float:
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000.0

    @staticmethod
    def detect_pauses(file_path: str, min_silence_len: int = 700, silence_thresh: int = -40) -> list[dict[str, float]]:
        audio = AudioSegment.from_file(file_path)
        nonsilent_ranges = detect_nonsilent(
            audio,
            min_silence_len=min_silence_len,
            silence_thresh=silence_thresh,
        )

        pauses: list[dict[str, float]] = []
        previous_end_ms = 0.0

        for start_ms, end_ms in nonsilent_ranges:
            gap_ms = start_ms - previous_end_ms
            if gap_ms >= min_silence_len:
                pauses.append(
                    {
                        "start_seconds": round(previous_end_ms / 1000.0, 2),
                        "end_seconds": round(start_ms / 1000.0, 2),
                        "duration_seconds": round(gap_ms / 1000.0, 2),
                    }
                )
            previous_end_ms = end_ms

        trailing_gap = len(audio) - previous_end_ms
        if trailing_gap >= min_silence_len:
            pauses.append(
                {
                    "start_seconds": round(previous_end_ms / 1000.0, 2),
                    "end_seconds": round(len(audio) / 1000.0, 2),
                    "duration_seconds": round(trailing_gap / 1000.0, 2),
                }
            )

        return pauses

    @staticmethod
    def transcribe_audio(file_path: str) -> tuple[str, list[dict[str, float | str]]]:
        if settings.openai_api_key:
            return ProcessingService._transcribe_with_openai(file_path)
        return ProcessingService._transcribe_fallback(file_path)

    @staticmethod
    def _transcribe_with_openai(file_path: str) -> tuple[str, list[dict[str, float | str]]]:
        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        with open(file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["word"],
            )

        words: list[dict[str, float | str]] = []
        if response.words:
            for item in response.words:
                words.append(
                    {
                        "word": item.word,
                        "start": float(item.start),
                        "end": float(item.end),
                    }
                )

        return response.text.strip(), words

    @staticmethod
    def _transcribe_fallback(file_path: str):
        model = WhisperModel(
            "base",
            device="cpu",
            compute_type="int8",
        )

        segments, info = model.transcribe(
            file_path,
            word_timestamps=True,
        )

        transcript_parts = []
        words = []

        for segment in segments:
            transcript_parts.append(segment.text)

            if hasattr(segment, "words") and segment.words:
                for word in segment.words:
                    words.append(
                        {
                            "word": str(word.word).strip(),
                            "start": float(word.start),
                            "end": float(word.end),
                        }
                    )

        transcript = " ".join(transcript_parts).strip()

        return transcript, words

    @staticmethod
    def analyze_filler_words(transcript: str) -> tuple[int, dict[str, int]]:
        breakdown: dict[str, int] = {}
        for match in FILLER_PATTERN.finditer(transcript):
            word = match.group(1).lower()
            breakdown[word] = breakdown.get(word, 0) + 1
        return sum(breakdown.values()), breakdown

    @staticmethod
    def calculate_speaking_rate(transcript: str, duration_seconds: float) -> float:
        if duration_seconds <= 0:
            return 0.0
        word_count = len(re.findall(r"\b\w+\b", transcript))
        minutes = duration_seconds / 60.0
        return round(word_count / minutes, 1) if minutes > 0 else 0.0

    @staticmethod
    def build_word_timestamps(
        transcript: str,
        whisper_words: list[dict[str, float | str]],
        duration_seconds: float,
    ) -> list[dict[str, float | str]]:
        if whisper_words:
            return whisper_words

        tokens = re.findall(r"\S+", transcript)
        if not tokens:
            return []

        slot = duration_seconds / len(tokens) if duration_seconds > 0 else 0.5
        return [
            {
                "word": token,
                "start": round(index * slot, 2),
                "end": round((index + 1) * slot, 2),
            }
            for index, token in enumerate(tokens)
        ]

    @staticmethod
    def generate_feedback(
        *,
        filler_count: int,
        filler_breakdown: dict[str, int],
        speaking_rate: float,
        pause_count: int,
        duration_seconds: float,
    ) -> tuple[str, int]:
        feedback_parts: list[str] = []
        score = 100

        if speaking_rate < 110:
            feedback_parts.append(
                "Your speaking pace is slow. Aim for 130–160 words per minute to keep interviewers engaged."
            )
            score -= 12
        elif speaking_rate > 180:
            feedback_parts.append(
                "Your speaking pace is fast. Slow down slightly and pause between key points for clarity."
            )
            score -= 10
        else:
            feedback_parts.append(
                "Your speaking pace is within a strong interview range. Maintain this rhythm while emphasizing key achievements."
            )

        if filler_count == 0:
            feedback_parts.append("Excellent control of filler words. Your answers sound confident and polished.")
        elif filler_count <= 5:
            feedback_parts.append(
                "Filler word usage is moderate. Replace fillers with a brief pause before answering difficult questions."
            )
            score -= 8
        else:
            top_fillers = ", ".join(
                f"'{word}' ({count})"
                for word, count in sorted(filler_breakdown.items(), key=lambda item: item[1], reverse=True)[:3]
            )
            feedback_parts.append(
                f"Reduce filler words ({top_fillers}). Practice structured responses using STAR format."
            )
            score -= min(25, filler_count * 2)

        if pause_count == 0:
            feedback_parts.append("No significant awkward pauses detected. Good flow throughout the recording.")
        elif pause_count <= 3:
            feedback_parts.append(
                "A few pauses were detected. Brief pauses can emphasize points, but avoid long silences mid-answer."
            )
            score -= 5
        else:
            feedback_parts.append(
                f"{pause_count} noticeable pauses detected. Prepare concise talking points to reduce hesitation."
            )
            score -= min(15, pause_count)

        if duration_seconds < 30:
            feedback_parts.append(
                "The recording is short. Practice full-length answers (60–90 seconds) for behavioral questions."
            )
            score -= 5
        elif duration_seconds > 600:
            feedback_parts.append(
                "The recording is long. Practice tighter answers that stay focused on the question asked."
            )
            score -= 5

        feedback_parts.append(
            "Next steps: re-record the same question, compare analytics, and track improvement on your progress page."
        )

        return "\n\n".join(feedback_parts), max(0, min(100, score))

    @staticmethod
    def enhance_feedback_with_openai(base_feedback: str, transcript: str) -> str:
        if not settings.openai_api_key or not transcript.strip():
            return base_feedback

        from openai import OpenAI

        client = OpenAI(api_key=settings.openai_api_key)
        prompt = (
            "You are an interview coach. Using the transcript and analytics notes below, "
            "write concise, actionable feedback in 3 short paragraphs covering clarity, confidence, and structure.\n\n"
            f"Analytics notes:\n{base_feedback}\n\nTranscript:\n{transcript[:6000]}"
        )
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Provide practical interview coaching feedback."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=500,
        )
        content = response.choices[0].message.content
        return content.strip() if content else base_feedback

    @staticmethod
    def process_interview(file_path: str) -> AnalysisResult:
        duration_seconds = ProcessingService.get_audio_duration_seconds(file_path)
        pauses = ProcessingService.detect_pauses(file_path)
        transcript, whisper_words = ProcessingService.transcribe_audio(file_path)
        filler_count, filler_breakdown = ProcessingService.analyze_filler_words(transcript)
        speaking_rate = ProcessingService.calculate_speaking_rate(transcript, duration_seconds)
        word_timestamps = ProcessingService.build_word_timestamps(transcript, whisper_words, duration_seconds)
        feedback, score = ProcessingService.generate_feedback(
            filler_count=filler_count,
            filler_breakdown=filler_breakdown,
            speaking_rate=speaking_rate,
            pause_count=len(pauses),
            duration_seconds=duration_seconds,
        )
        feedback = ProcessingService.enhance_feedback_with_openai(feedback, transcript)

        return AnalysisResult(
            transcript=transcript,
            filler_count=filler_count,
            filler_word_breakdown=filler_breakdown,
            speaking_rate=speaking_rate,
            pause_count=len(pauses),
            pauses=pauses,
            word_timestamps=word_timestamps,
            feedback=feedback,
            overall_score=score,
            duration_seconds=duration_seconds,
        )

    @staticmethod
    def serialize_json(data: object) -> str:
        return json.dumps(data)

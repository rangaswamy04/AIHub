from django.urls import path

from .views import (
    AIChatView,
    TextGeneratorView,
    SummarizerView,
    CodeAssistantView,
    ResumeAnalyzerView
)

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),

    path(
        'generate-text/',
        TextGeneratorView.as_view(),
        name='generate-text'
    ),

    path(
        'summarize/',
        SummarizerView.as_view(),
        name='summarize'
    ),

    path(
        'code-assistant/',
        CodeAssistantView.as_view(),
        name='code-assistant'
    ),

    path(
        'resume-analyzer/',
        ResumeAnalyzerView.as_view(),
        name='resume-analyzer'
    ),
]
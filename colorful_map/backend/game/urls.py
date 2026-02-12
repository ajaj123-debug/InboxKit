from django.urls import path
from .views import BlockList, LeaderboardView

urlpatterns = [
    path('blocks/', BlockList.as_view(), name='block-list'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

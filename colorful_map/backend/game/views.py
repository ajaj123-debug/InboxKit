from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from .models import Block
from .serializers import BlockSerializer

class BlockList(generics.ListAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer

class LeaderboardView(APIView):
    def get(self, request):
        data = (
            Block.objects.values('owner_name')
            .exclude(owner_name__isnull=True)
            .exclude(owner_name="")
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        return Response(list(data))

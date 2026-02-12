from django.db import models
from django.contrib.auth.models import User

class Block(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    color = models.CharField(max_length=7, default="#FFFFFF")  # Hex code
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    owner_name = models.CharField(max_length=50, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('x', 'y')

    def __str__(self):
        return f"Block ({self.x}, {self.y}) - {self.color}"

from django.contrib import admin
from .models import Search
from .models import SearchResultGoogleNumber
from .models import SearchResultGoogleLink

admin.site.register(Search)
admin.site.register(SearchResultGoogleNumber)
admin.site.register(SearchResultGoogleLink)

# Register your models here.

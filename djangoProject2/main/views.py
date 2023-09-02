from django.shortcuts import render
from django.http import HttpResponse
from .models import SearchResultGoogleNumber
from .models import SearchResultGoogleLink
from .models import Search
from .forms import SearchForm

def index(request):
    SearchWorkNumber = SearchResultGoogleNumber.objects.all()
    SearchWorkLinks = SearchResultGoogleLink.objects.all()
    SearchWorkNumberOfSearch = Search.objects.all()
    error = ''
    if request.method == 'POST':
        form = SearchForm(request.POST)
        if form.is_valid():
            form.save()
        else:
            error = 'Error'

    form = SearchForm()

    return render(request, 'main/index.html', {'SearchResultGoogleNumbers': SearchWorkNumber, 'SearchResultGoogleSearchTime': SearchWorkNumber, 'SearchResultGoogleLinks': SearchWorkLinks, 'SearchNumber': SearchWorkNumberOfSearch, 'SearchResultGoogleLinksNumberResponse': SearchWorkLinks, 'form': form},)

def about(request):
    return render(request, 'main/about.html', {'form': SearchForm})
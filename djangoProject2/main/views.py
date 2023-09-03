from django.shortcuts import render
from django.http import HttpResponse
from .models import SearchResultGoogleNumber
from .models import SearchResultGoogleLink
from .models import Search
import requests
import sqlite3
from sqlite3 import Error
from bs4 import BeautifulSoup
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
            SearchWorkNumberOfSearch = Search.objects.all()
            last_request = SearchWorkNumberOfSearch[len(SearchWorkNumberOfSearch)-1]
            search =  last_request
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36"}
            URL_Google = "https://www.google.com/search?q=" + str(search)
            URL_Yandex = "https://yandex.ru/search/?text=" + str(search)
            URL_Yahoo  = "https://search.yahoo.com/search?p=" + str(search)
            URL_Bing   = "https://www.bing.com/search?q=" + str(search)
            result_google = requests.get(URL_Google, headers=headers)
            response_google = requests.post(URL_Google)
            ###print(soup.prettify())
            soup = BeautifulSoup(result_google.content, 'html.parser')
            total_results_text = soup.find("div", {"id": "result-stats"}).find(string=True, recursive=False)
            results_num = ''.join([num for num in total_results_text if num.isdigit()])


            SearchResultGoogleNumber.objects.all().delete()
            SearchResultGoogleLink.objects.all().delete()

            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Google,
                SearchResultGoogleLinksNumber = 100,
                SearchResultGoogleLinksNumberResponse = 1
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yandex,
                SearchResultGoogleLinksNumber = 101,
                SearchResultGoogleLinksNumberResponse = 2
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Yahoo,
                SearchResultGoogleLinksNumber = 102,
                SearchResultGoogleLinksNumberResponse = 3
            )
            SearchResultGoogleLink.objects.create(
                SearchResultGoogleLinks = URL_Bing,
                SearchResultGoogleLinksNumber = 103,
                SearchResultGoogleLinksNumberResponse = 4
            )
            SearchResultGoogleNumber.objects.create(
                SearchResultGoogleNumbers = results_num,
                SearchResultGoogleSearchTime = response_google.elapsed.total_seconds()
            )


        else: 
            error = 'Error'

    form = SearchForm()

    context = {
        'SearchResultGoogleNumbers': SearchWorkNumber, 
        'SearchResultGoogleSearchTime': SearchWorkNumber, 
        'SearchResultGoogleLinks': SearchWorkLinks, 
        'SearchNumber': SearchWorkNumberOfSearch, 
        'SearchResultGoogleLinksNumberResponse': SearchWorkLinks, 
        'form': form}

    return render(request, 'main/index.html', context)

def about(request):
    return render(request, 'main/about.html', {'form': SearchForm})
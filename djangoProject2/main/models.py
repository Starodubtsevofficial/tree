from django.db import models


class Search(models.Model):
    SearchNumber = models.TextField('Номер поиска', default=1, blank=True, null=True)
    GetSearch = models.CharField('Поисковой запрос', max_length=100)


    def __str__(self):
        return self.GetSearch


    class Meta:
        verbose_name = 'Search'
        verbose_name_plural = 'Search'

class SearchResultGoogleNumber(models.Model):
    SearchResultGoogleNumbers = models.CharField('Найдено результатов', max_length=10)
    SearchResultGoogleSearchTime = models.CharField(default= 'Время выполнения', max_length=6)

    def __str__(self):
        return self.SearchResultGoogleNumbers


    class Meta:
        verbose_name = 'SearchResultGoogleNumber'
        verbose_name_plural = 'SearchResultGoogleNumber'

class SearchResultGoogleLink(models.Model):
    SearchResultGoogleLinks = models.TextField('Ссылка', max_length=2000)
    SearchResultGoogleLinksNumber = models.TextField('Номер Ссылки', default=100)
    SearchResultGoogleLinksNumberResponse = models.TextField('Какой был номер запроса?', default=1)

    def __str__(self):
        return self.SearchResultGoogleLinks

    class Meta:
        verbose_name = 'SearchResultGoogleLinks'
        verbose_name_plural = 'SearchResultGoogleLinks'
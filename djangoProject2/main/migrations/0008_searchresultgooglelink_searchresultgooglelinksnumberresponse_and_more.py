# Generated by Django 4.2.4 on 2023-08-31 14:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_search_searchnumber_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='searchresultgooglelink',
            name='SearchResultGoogleLinksNumberResponse',
            field=models.TextField(default=1, verbose_name='Какой был номер запроса?'),
        ),
        migrations.AlterField(
            model_name='searchresultgooglelink',
            name='SearchResultGoogleLinksNumber',
            field=models.TextField(default=100, verbose_name='Номер Ссылки'),
        ),
    ]
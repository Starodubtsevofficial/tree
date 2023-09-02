# Generated by Django 4.2.4 on 2023-08-31 14:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_rename_searchresultgooglelinks_searchresultgooglelink_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='search',
            name='SearchNumber',
            field=models.TextField(default='1', verbose_name='Номер поиска'),
        ),
        migrations.AddField(
            model_name='searchresultgooglelink',
            name='SearchResultGoogleLinksNumber',
            field=models.TextField(default=1, verbose_name='Номер Ссылки'),
        ),
        migrations.AlterField(
            model_name='searchresultgooglelink',
            name='SearchResultGoogleLinks',
            field=models.TextField(max_length=2000, verbose_name='Ссылка'),
        ),
    ]
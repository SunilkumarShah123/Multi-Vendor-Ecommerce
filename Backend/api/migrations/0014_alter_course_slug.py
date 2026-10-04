from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_rename_file_variantitem_varient_file"),
    ]

    operations = [
        migrations.AlterField(
            model_name="course",
            name="slug",
            field=models.SlugField(
                blank=True, editable=False, max_length=255, null=True, unique=True
            ),
        ),
    ]
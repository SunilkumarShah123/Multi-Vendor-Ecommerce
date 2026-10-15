from django.db import migrations


def remove_google_social_accounts(apps, schema_editor):
    social_account = apps.get_model("socialaccount", "SocialAccount")
    social_account.objects.using(schema_editor.connection.alias).filter(
        provider="google"
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("account", "0009_emailaddress_unique_primary_email"),
        ("socialaccount", "0006_alter_socialaccount_extra_data"),
        ("userauths", "0005_profile_updated_at_user_date"),
    ]

    operations = [
        migrations.RunPython(
            remove_google_social_accounts,
        ),
    ]

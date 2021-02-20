from huey.contrib.djhuey import task
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

@task(priority=10)
def email_reset_password_link(username, email, url):
    host = settings.HOST

    context = {
        'username': username,
        'reset_password_url':  url
    }

    # render email text
    email_html_message = render_to_string('user_reset_password.html', context)
    email_plaintext_message = render_to_string('user_reset_password.txt', context)

    msg = EmailMultiAlternatives(
        # title:
        "Password Reset for {title}".format(title=settings.WEBAPP_NAME),
        # message:
        email_plaintext_message,
        # from:
        "{} <noreply@{}>".format(settings.WEBAPP_NAME, host),
        # to:
        [email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    msg.send()
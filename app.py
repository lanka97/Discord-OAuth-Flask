import os
from flask import Flask, g, session, redirect, request, url_for, jsonify, render_template
from flask_cors import CORS
from requests_oauthlib import OAuth2Session

DISCORD_OAUTH2_CLIENT_ID = '761778934848421929'
DISCORD_OAUTH2_CLIENT_SECRET = 'PTKRYcJ2HdnlRkYoU7ShQw8VU-IPz5an'
DISCORD_OAUTH2_REDIRECT_URI = 'http://localhost:5000/callback'

API_BASE_URL = os.environ.get('API_BASE_URL', 'https://discordapp.com/api')
AUTHORIZATION_BASE_URL = API_BASE_URL + '/oauth2/authorize'
TOKEN_URL = API_BASE_URL + '/oauth2/token'

app = Flask(__name__)
CORS(app)
app.debug = True
app.config['SECRET_KEY'] = DISCORD_OAUTH2_CLIENT_SECRET

if 'http://' in DISCORD_OAUTH2_REDIRECT_URI:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'


def token_updater(token):
    session['oauth2_token'] = token


def create_session(token=None, state=None, scope=None):
    return OAuth2Session(
        client_id=DISCORD_OAUTH2_CLIENT_ID,
        token=token,
        state=state,
        scope=scope,
        redirect_uri=DISCORD_OAUTH2_REDIRECT_URI,
        auto_refresh_kwargs={
            'client_id': DISCORD_OAUTH2_CLIENT_ID,
            'client_secret': DISCORD_OAUTH2_CLIENT_SECRET,
        },
        auto_refresh_url=TOKEN_URL,
        token_updater=token_updater)


@app.route('/')
def index2():
    return render_template('index.html')


@app.route('/login')
def index():
    scope = request.args.get(
        'scope',
        'identify email connections guilds guilds.join')
    discord = create_session(scope=scope.split(' '))
    authorization_url, state = discord.authorization_url(AUTHORIZATION_BASE_URL)
    session['oauth2_state'] = state
    print("authorization_url", authorization_url)
    return redirect(authorization_url)


@app.route('/callback')
def callback():
    if request.values.get('error'):
        return request.values['error']
    discord = create_session(state=session.get('oauth2_state'))
    token = discord.fetch_token(
        TOKEN_URL,
        client_secret=DISCORD_OAUTH2_CLIENT_SECRET,
        authorization_response=request.url)
    print("test")
    session['oauth2_token'] = token
    print(session.get('oauth2_token'))
    return redirect(url_for('.profile'))


@app.route('/profile')
def profile():
    discord = create_session(token=session.get('oauth2_token'))
    user_details = discord.get(API_BASE_URL + '/users/@me').json()
    return render_template('profile.html', user=user_details)


@app.route('/channels')
def channels():
    discord = create_session(token=session.get('oauth2_token'))
    guild_details = discord.get(API_BASE_URL + '/users/@me/guilds').json()
    return render_template('channels.html', guilds=guild_details)


@app.route('/connections')
def connections():
    discord = create_session(token=session.get('oauth2_token'))
    connection_details = discord.get(API_BASE_URL + '/users/@me/connections').json()
    return render_template('connections.html', connections=connection_details)


@app.route('/data')
def data():
    discord = create_session(token=session.get('oauth2_token'))
    user_details = discord.get(API_BASE_URL + '/users/@me').json()
    guild_details = discord.get(API_BASE_URL + '/users/@me/guilds').json()
    connection_details = discord.get(API_BASE_URL + '/users/@me/connections').json()
    return jsonify(user=user_details, guilds=guild_details, connections=connection_details)


if __name__ == '__main__':
    app.run()
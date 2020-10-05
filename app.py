import os
from flask import Flask, g, session, redirect, request, url_for, jsonify, render_template
from flask_cors import CORS
from requests_oauthlib import OAuth2Session

OAUTH2_CLIENT_ID = '761778934848421929'
OAUTH2_CLIENT_SECRET = 'PTKRYcJ2HdnlRkYoU7ShQw8VU-IPz5an'
OAUTH2_REDIRECT_URI = 'http://localhost:5000/callback'

API_BASE_URL = os.environ.get('API_BASE_URL', 'https://discordapp.com/api')
AUTHORIZATION_BASE_URL = API_BASE_URL + '/oauth2/authorize'
TOKEN_URL = API_BASE_URL + '/oauth2/token'

app = Flask(__name__)
CORS(app)
app.debug = True
app.config['SECRET_KEY'] = OAUTH2_CLIENT_SECRET

if 'http://' in OAUTH2_REDIRECT_URI:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'


def token_updater(token):
    session['oauth2_token'] = token


def make_session(token=None, state=None, scope=None):
    return OAuth2Session(
        client_id=OAUTH2_CLIENT_ID,
        token=token,
        state=state,
        scope=scope,
        redirect_uri=OAUTH2_REDIRECT_URI,
        auto_refresh_kwargs={
            'client_id': OAUTH2_CLIENT_ID,
            'client_secret': OAUTH2_CLIENT_SECRET,
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
    discord = make_session(scope=scope.split(' '))
    authorization_url, state = discord.authorization_url(AUTHORIZATION_BASE_URL)
    session['oauth2_state'] = state
    print("authorization_url", authorization_url)
    return redirect(authorization_url)


@app.route('/callback')
def callback():
    if request.values.get('error'):
        return request.values['error']
    discord = make_session(state=session.get('oauth2_state'))
    token = discord.fetch_token(
        TOKEN_URL,
        client_secret=OAUTH2_CLIENT_SECRET,
        authorization_response=request.url)
    print("tets")
    #print(token)
    session['oauth2_token'] = token
    print(session.get('oauth2_token'))
    return redirect(url_for('.profile'))


@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/profile')
def profile():
    discord = make_session(token=session.get('oauth2_token'))
    user = discord.get(API_BASE_URL + '/users/@me').json()
    return render_template('index2.html', user=user)

@app.route('/channels')
def channels():
    discord = make_session(token=session.get('oauth2_token'))
    guilds = discord.get(API_BASE_URL + '/users/@me/guilds').json()
    return render_template('index3.html', guilds=guilds)

@app.route('/connections')
def connections():
    discord = make_session(token=session.get('oauth2_token'))
    connections = discord.get(API_BASE_URL + '/users/@me/connections').json()
    return render_template('index4.html', connections=connections)


@app.route('/data')
def data():
    discord = make_session(token=session.get('oauth2_token'))
    user = discord.get(API_BASE_URL + '/users/@me').json()
    guilds = discord.get(API_BASE_URL + '/users/@me/guilds').json()
    connections = discord.get(API_BASE_URL + '/users/@me/connections').json()
    return jsonify(user=user, guilds=guilds, connections=connections)

if __name__ == '__main__':
    app.run()



# OAUTH2_CLIENT_ID=761778934848421929 OAUTH2_CLIENT_SECRET=PTKRYcJ2HdnlRkYoU7ShQw8VU-IPz5an python app.py
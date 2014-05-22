# Installation
1. [Setup Redis](http://redis.io/topics/quickstart)
1. Install ```node```
1. git clone https://github.com/stumped2/express-directory-provider.git
1. cd express-directory-provider/
1. ```npm install```
1. ```node app.js```

# What is a Directory Provider?
A Directory Provider (dirp) is a remote resource used for the Privly PGP
application.

The dirp is used to create the Persona cryptographic keypair used to verify
identity as well as used in the association of pgp keys to the user verified
through Persona.

## Usage

#### Login
A user goes to the index page of the dirp and "logs in" using Persona (there is
no actual logging in of the dirp, this step is only to generate the Persona
cryptographic keypair as well as the Persona backed identity assertion).

Once the user has logged in, the Persona Backed Identity Assertion (bia) is
stored in the dirp's key-value store with the user's email from the bia being
the key.

#### Storage
The user then uploads their pgp public key (which has been signed by the user's
private key that was generated from the persona log inon the user's computer) to
the dirp using their email from the Persona log in as the identifier.

#### Searching
The user then searches the dirp (by email or pgp public key) for other Privly
PGP application users which will then download the pgp public key to be used in
the message sending or receiving process.

## API
There are 2 endpoints that a Directory Provider is required to have: ```store```
and ```search```. You must also have an index page to facilitate the Persona
login process.

#### store
This endpoint is used to upload a signed pgp public key (and by signed I mean
signed by the private key from the Persona log in process)from the Privly PGP
Application. The format this endpoint expects two (2) keys with one (1) value
for each key.

Example:

```
email=<validly formatted email>
pgp=<signed pgp public key>
```

If anything more or less than email and pgp are sent as keys, the dirp will
return an ```HTTP 400``` error code. The same response will be sent if more than
one (1) value is associated for a key.

Bad Example:

```
email=<email1>
email=<email2>
pgp=<signed pgp public key>
```

CURL Example:

```bash
curl --request GET 'http://<dirp url>/store?email=bob@example.com&pgp=dsfdsfds'
```

#### search

http://etherpad.osuosl.org/privly

## Formats
There are specific formats for data used in the dirp.

#### Backed Identity Assertion
This format is expected to [change](http://lloyd.io/evolving-browserid-data-formats/)
at some point to better track JOSE.
Use this link as a reference to change the functions for extracting the public
key and email from the backed identity assertion.

The overall format of a backed identity assertion is as follows:
```<cert header>.<cert payload>.<cert signature>~<assertion header>.<assertion payload>.<assertion signature>```

Each section of the bia is base64url encoded.

The cert payload is where most of the information the dirp needs.
The overall structure is as follows:

```javascript
{
  "iss": .....,
  "iat": .....,
  "public-key": {
    "y": ...,
    "p": ...,
    "g": ...,
    "q": ...,
    "algorithm": "DS"
  },
  "exp": ...,
  "principal": {
    "email": <email address you used to log in using persona>
  }
}
```

#### Directory Provider Records
The Directory Provider will return the list of matched bia and pgp keys. It is
an array of JSON objects, where the JSON object is a bia and a pgp key. If there
are no matched bia to pgp keys, the dirp will not return anything. Here is an
example:

```javascript
[
  {"bia": <bia>, "pgp": <pgp key>},
  {"bia": <bia>, "pgp": <pgp key>},
  ....
]
```
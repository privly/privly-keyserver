# What is a Privly Key Server?
This is a reference implementation for and experimental key server.

A Privly Key Server (keyserver) is a remote resource used for the [Privly PGP](https://github.com/irdan/privly-applications/blob/irdan/DirectoryInteraction/README.md)
application.

The keyserver is used to create the Persona cryptographic keypair used to verify
identity as well as used in the association of pgp keys to the user verified
through Persona.

# Installation
1. [Setup Redis](http://redis.io/topics/quickstart)
1. Install ```node```
1. Clone the repo
1. cd into the repo
1. In production, change session secret in [app.js](app.js)
1. ```npm install```
1. ```node app.js```
1. Default url: ```http://localhost:5000``` (the port is configureable in [app.js](app.js))

## Usage

#### Login
A user goes to the index page of the keyserver and "logs in" using Persona
(there is no actual logging in of the keyserver, this step is only to generate
the Persona cryptographic keypair as well as the Persona backed identity
assertion).

Once the user has logged in, the Persona Backed Identity Assertion (bia) is
stored in the keyserver's key-value store with the user's email from the bia
being the key.

#### Storage
The user then uploads their pgp public key (which has been signed by the user's
private key that was generated from the persona log in on the user's computer)
to the keyserver using their email from the Persona log in as the identifier.

The interaction with this endpoint will be handled in an application in
[privly-applications](https://github.com/privly/privly-applications).

#### Searching
The user then searches the keyserver (by email or pgp public key) for other
Privly PGP application users which will then download the pgp public key to be
used in the message sending or receiving process.

The interaction with this endpoint will be handled in an application in
[privly-applications](https://github.com/privly/privly-applications).

## API
There are 2 endpoints that a Directory Provider is required to have: ```store```
and ```search```. Currently, interaction with these two (2) endpoints is with
```GET``` requests. This will be changing to ```POST``` requests in the future
(see [#69](https://github.com/privly/privly-applications/issues/69)).
You must also have an index page to facilitate the Persona
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

If anything more or less than ```email``` and ```pgp``` are sent as keys, the
keyserver will return an ```HTTP 400``` error code. The same response will be
sent if more than one (1) value is associated for a key. If an incorrectly
formatted email is sent to the keyserver, it will return an ```HTTP 400``` error
code.

Bad Example:

```
email=<email1>
email=<email2>
pgp=<signed pgp public key>
```

Valid CURL Example:

```bash
curl --request GET 'http://<keyserver url>/store?email=bob@example.com&pgp=dsfdsfds'
```

#### search
The search endpoint is used to search for PGP public keys associated with the
user's email. The format for this endpoint expects one (1) key with one (1)
value for the key. Valid query keys are ```email``` OR ```pgp```.
If any keys other than ```pgp``` OR ```email``` are sent to this endpoint, the
keyserver will return an ```HTTP 400``` error code. If more than 1 value is sent
for the key, the keyserver will respond with an ```HTTP 400``` error code. If an
incorrectly formatted email is used, the keyserver will return an ```HTTP 400```
error code.

If the matched ```email``` being queried or matched pgp public key being queried
is not found in the keyserver's key-value store, the keyserver will return an
```HTTP 404``` error code otherwise it will respond with a list of JSON objects
for matched PGP public key and bias (See Format section for example).

Bad Example:

```
email=<email>
other=<somehting else>
```

Valid CURL Example:

```bash
curl --request GET 'http://<keyserver url>/search?email=no@no.no'

## Formats
There are specific formats for data used in the keyserver.

#### Backed Identity Assertion
This format is expected to [change](http://lloyd.io/evolving-browserid-data-formats/)
at some point to better track JOSE.
Use this link as a reference to change the functions for extracting the public
key and email from the backed identity assertion.

The overall format of a backed identity assertion is as follows:
```<cert header>.<cert payload>.<cert signature>~<assertion header>.<assertion payload>.<assertion signature>```

Each section of the bia is base64url encoded.

The cert payload is where most of the information the keyserver needs.
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
are no matched bia to pgp keys, the keyserver will not return anything. Here is
an example:

```javascript
[
  {"bia": <bia>, "pgp": <pgp key>},
  {"bia": <bia>, "pgp": <pgp key>},
  ....
]
```
# Testing
The Privly key server uses ```mocha``` as its testing library. The
```devDependencies``` in the ```package.json``` file shows the required node
libraries used for testing.

### Usage
The ```Makefile``` assumes that mocha is installed locally in the folder that
the key server was cloned into. To run all the tests, just type
```Make test``` and it will run through all the tests defined in the
```test``` folder. Another option is to use ```npm test``` which will accomplish
the same thing as the ```Makefile```. To test the individual files, run
``` make <desired test>```. An example for testing the index page is
```make index```.
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
stored in the dirp's key-value store with the users's email from the bia being
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
curl -i -H "Accept: application/json" http://<dirp url>/store?email=bob@example.com&pgp=hffdjlkfg
```

#### search
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
stored in the dirp's key-value store with their email from the bia being the
key.

#### Storage
The user then uploads the pgp public key (which has been signed by the persona
process's private key on the user's computer) to the dirp using their email from
the Persona login as the identifier.

#### Searching
The user then searches the dirp (by email or pgp public key) for other Privly
PGP application users which will then download the pgp public key to be used in
the message sending or receiving process.


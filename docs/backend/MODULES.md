# MODULE OR COMPONENT

Each module have to be isolated and closed, only expose a interface that going to be inject the manager implementation facade with component functions

Responsibilities:
Expose the component funcionalities

Ports
The components may expose rest endpoints throug express-controller

Components
data: is the data layer representation, has repositories, and model domain implementations.

domain: has domain business contracts

application: application of domain and use case implementation.

controllers: context of input and output ports function.

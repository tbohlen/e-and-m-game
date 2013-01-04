
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// Time Stepper /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/*
 * Function: eulerStep
 * executes a single forward Euler integration step of size timeStep on the
 * provided particle system.
 */
function eulerStep(system, timeStep) {
    var currentState = system.getState();
    var deriv = system.evalDeriv(currentState);
    var key;
    for (key in currentState) {
        var particle = currentState[key];

        currentState[key] = addVectors(particle, scale(deriv[key], timeStep));
    }
    system.setState(currentState);
}

/*
 * Function: trapezoidalStep
 * Executes a single trapezoidal integration step forward of size timeStep.
 */
function trapezoidalStep(system, timeStep) {
    // find the next state, given a full euler step
    var currentState = system.getState();
    var deriv = system.evalDeriv(currentState);
    var nextState = {};
    var key;
    for (key in currentState) {
        var particle = currentState[key];

        nextState[key] = addVectors(particle, scale(deriv[key], timeStep));
    }

    // find the derivative at this next state
    var nextDeriv = system.evalDeriv(nextState);

    // use the two derivatives to find a better approximate state
    for (key in currentState) {
        var particle = currentState[key];

        currentState[key] = addVectors(particle, scale(addVectors(deriv[key], nextDeriv[key]), timeStep/2));
    }

    system.setState(currentState);
}



///////////////////////////////////////////////////////////////////////////////
////////////////////////////// ChargeSystem /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



/*
 * Constructor: ChargeSystem
 * Builds a particle system that will calculate forces on all particles in its
 * particles object given the positions and charges. This does not handle
 * drawing and assumes that the state of each particle is a vector of [x, y,
 * velX, velY, charge]
 */
function ChargeSystem() {
    this.lastIndex = -1;
    this.charges = {}
    this.forceCoeff = 1;
    this.intervalID = 0;
}

/*
 * Method: start
 * Starts the system bu registering the position recalculation function to
 * happen every LOGIC_DELAY milliseconds.
 *
 * Member Of: ChargeSystem
 */
ChargeSystem.prototype.start = function() {
};

/*
 * Method: addCharge
 * Adds the given charge to the system. The charge has to include the keys x,
 * y, velX, velY, charge, and static.
 *
 * Parameters:
 * charge - the charge to add to the system
 *
 * Member Of: ChargeSystem
 */
ChargeSystem.prototype.addCharge = function(charge) {
    this.lastIndex++;
    this.charges[this.lastIndex] = charge;
};

/*
 * Method: evalDeriv
 * Evaluates the derivative of the given system state. This does not use
 * "this.charges"! It uses whatever state is passed to it.
 * 
 * This function calculates the electrostatic force between the particles.
 *
 * Parameters:
 * state - the state at which to calculate the force
 *
 * Member Of: ChargeSystem
 */
ChargeSystem.prototype.evalDeriv = function(state) {
    var key, i, j, k;
    var keys = Object.keys(state);
    var deriv = {};
    // initialize the derivatives
    for (k = 0; k < keys.length; k++) {
        var key = keys[k];
        deriv[key] = [state[key][3], state[key][4], state[key][5], 0, 0, 0, 0];
    }
    // iterate over pairs of particles and modify their derivatives
    for (i = 0; i < keys.length; i++) {
        for (j = i+1; j < keys.length; j++) {
            var keyOne = keys[i];
            var keyTwo = keys[j];
            var one = state[keyOne];
            var two = state[keyTwo];
            var dist = distance(one[0], one[1], one[2], two[0], two[1], two[2])
            var force = one[6] * two[6] * this.forceCoeff * Math.pow(dist, -3)
            deriv[keyOne][3] += force * one[0];
            deriv[keyOne][4] += force * one[1];
            deriv[keyOne][5] += force * one[2];
            deriv[keyTwo][3] += force * two[0];
            deriv[keyTwo][4] += force * two[1];
            deriv[keyTwo][5] += force * two[2];
        }
    }
    return deriv;
};

/*
 * Method: getState
 * Returns a copy of the state of the particle system.
 *
 * Member Of: ChargeSystem
 */
ChargeSystem.prototype.getState = function() {
    var state = {};
    var key;
    for (key in this.charges) {
        var ch = this.charges[key];
        state[key] = [ch.position.x, ch.position.y, ch.position.z, ch.velocity[0], ch.velocity[1], ch.velocity[2], ch.charge];
    }
    return state;
};

/*
 * Method: setState
 * Sets the state of each particle to the state mapped to the same key in the
 * newState array passed as an argument to this function.
 *
 * Parameters:
 * newState - the new state of the system.
 *
 * Member Of: ChargeSystem
 */
ChargeSystem.prototype.setState = function(newState) {
    var key;
    for (key in this.charges) {
        if (!this.charges[key].static) {
            // set each value in the charge manually. Transform inconvenient and
            // slow (rather than just setting an array) but helps code elsewhere
            var ch = this.charges[key];
            var st = newState[key];
            ch.position.x = st[0];
            ch.position.y = st[1];
            ch.position.z = st[2];
            ch.velocity = [st[3], st[4], st[5]];
            ch.charge = st[6];
        }
    }
};

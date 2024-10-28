import { useEffect } from "react";

// WRONG? FIXME
var didInit = false

export const envSetup = () => { // run only once:
    if (!didInit) {
        didInit = true;
        // TODO if developement, deploy contractTracker.vy
        // if prod, use default location of contractTracker.vy
        if (__DEV__) {
            console.log('Development');
        } else {
            console.log('Production');
        }
    }
}

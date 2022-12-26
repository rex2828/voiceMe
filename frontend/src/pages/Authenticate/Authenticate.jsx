import React, { useState } from 'react';
import EmailPhonePage from '../Steps/EmailPhonePage/EmailPhonePage';
import OTP from '../Steps/OTP/OTP';

const steps = {
    1: EmailPhonePage,
    2: OTP,
};

const Authenticate = () => {
    const [step, setStep] = useState(1);
    const Step = steps[step];

    function onNext() {
        setStep(step + 1);
    }

    return <Step onNext={onNext} />;
};

export default Authenticate;
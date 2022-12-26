import React, { useState } from 'react';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import TextInput from '../../../components/TextInput/TextInput';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '../../../store/activateSlice';
import styles from './Name.module.css';
const Name = ({ onNext }) => {
    const { name } = useSelector((state) => state.activateSlice);
    const dispatch = useDispatch();
    const [fullname, setFullname] = useState(name);

    function nextStep() {
        if (!fullname) {
            return;
        }
        dispatch(setName(fullname));
        onNext();
    }
    return (
        <>
            <Card title="What’s your full name?" icon="specs-face">
                <TextInput
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                />
                <p className={styles.paragraph}>
                    People use real names at codershouse :)
                </p>
                <div>
                    <Button onClick={nextStep} text="Next" />
                </div>
            </Card>
        </>
    );
};

export default Name;
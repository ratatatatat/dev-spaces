

import { UnknownAction } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addServiceAction } from '../../redux/slices/service';

const ServiceForm = () => {
    const [serviceName, setServiceName] = useState('');
    const [serviceDirectory, setServiceDirectory] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = () => {
        dispatch(
            addServiceAction({
                name: serviceName,
                directoryPath: serviceDirectory,
            }) as any as UnknownAction
        ); setServiceName('');
        setServiceDirectory('');
    };

    return (
        <Card className='my-4'>
            <Card.Body>
                <Card.Title>Service Commander</Card.Title>
                <Card.Text>
                    Service Commander is a tool to help you manage your services.
                </Card.Text>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Control required placeholder='Name' type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} />
                    </Form.Group>
                    <Form.Group className='my-2'>
                        <Form.Control required placeholder='Directory' type="text" value={serviceDirectory} onChange={e => setServiceDirectory(e.target.value)} />
                    </Form.Group>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={serviceName === '' || serviceDirectory === ''}
                    >
                        Create Service
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}


export default ServiceForm;
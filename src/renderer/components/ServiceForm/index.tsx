

import { UnknownAction } from '@reduxjs/toolkit';
import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addServiceAction } from '../../redux/slices/service';
import translations from '../../translations/en';

const ServiceForm = () => {
    const [serviceName, setServiceName] = useState('');
    const [serviceDirectory, setServiceDirectory] = useState('');
    const dispatch = useDispatch();

    const handleSubmit = () => {
        dispatch(
            addServiceAction({
                name: serviceName,
                directoryPath: serviceDirectory,
                notes: '',
            }) as any as UnknownAction
        ); setServiceName('');
        setServiceDirectory('');
    };

    return (
        <Card>
            <Card.Body>
                <Card.Title>
                    {
                        translations.title
                    }
                </Card.Title>
                <Card.Text className="text-sm">
                    {
                        translations.description
                    }
                    <br />
                    <br />
                    {
                        translations.subDescription
                    }
                </Card.Text>
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>
                            {
                                translations.newServiceNameLabel
                            }
                        </Form.Label>
                        <Form.Control
                            required
                            placeholder={translations.newServiceNamePlaceholder}
                            type="text"
                            value={serviceName}
                            onChange={e => setServiceName(e.target.value)}
                        />
                        <Form.Text>
                            {
                                translations.newServiceNameDescription
                            }
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className='my-2'>
                        <Form.Label>
                            {
                                translations.newServiceDirectoryLabel
                            }
                        </Form.Label>
                        <Form.Control 
                            required 
                            placeholder={
                                translations.newServiceDirectoryPlaceholder
                            }
                            type="text" 
                            value={serviceDirectory}
                            onChange={e => setServiceDirectory(e.target.value)} />
                        <Form.Text>
                            {
                                translations.newServiceDirectoryDescription
                            }
                        </Form.Text>
                    </Form.Group>
                    <Button
                        style={{
                            marginTop: '10px',
                        }}
                        variant="primary"
                        type="submit"
                        disabled={serviceName === '' || serviceDirectory === ''}
                    >
                        {
                            translations.newServiceButton
                        }
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}


export default ServiceForm;
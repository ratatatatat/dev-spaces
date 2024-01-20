import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { addServiceAction, deleteServiceAction, initiateServicesAction, selectServices } from './redux/slices/service';
import { UnknownAction } from '@reduxjs/toolkit';
import { Service } from '../Types';

const App = () => {
    const [serviceName, setServiceName] = useState('');
    const [serviceDirectory, setServiceDirectory] = useState('');
    const dispatch = useDispatch();
    const services = useSelector(selectServices);

    const handleSubmit = () => {
        dispatch(
            addServiceAction({
                name: serviceName,
                directoryPath: serviceDirectory,
            }) as any as UnknownAction
        ); setServiceName('');
        setServiceDirectory('');
    };

    useEffect(() => {
        dispatch(initiateServicesAction() as any);
    }, []); // dispatch is stable and won't cause unnecessary re-renders


    const openTerminal = (service: Service) => {
        const randomUuid = Math.random().toString(36).substring(7);
        
    }

    return (
        <Container>
            <Row>
                <Col>
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
                        <Button variant="primary" type="submit">
                            Create Service
                        </Button>
                    </Form>
                    </Card.Body>
                </Card>

                </Col>
            </Row>
            <Row>
                <Col>
                    <h2>Services</h2>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Accordion>
                        {services.map((service, index) => (

                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header>{service.name}</Accordion.Header>
                                <Accordion.Body className='w-full flex justify-content-between' >
                                    <Button
                                        onClick={() => {
                                            dispatch(deleteServiceAction(service.id as number) as any as UnknownAction);
                                        }}
                                    variant="danger">Delete</Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => {
                                        }}
                                    >Open</Button>
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Col>
            </Row>
        </Container>
    );
};

export default App;
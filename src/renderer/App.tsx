import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Card, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { addServiceAction, createTerminalAction, deleteServiceAction, deleteTerminalAction, initiateServicesAction, selectServices } from './redux/slices/service';
import { UnknownAction } from '@reduxjs/toolkit';
import { DBService, Service } from '../Types';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                send: (channel: string, data: any) => void;
                on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
            };
        };
    }
}


const TerminalItem = ({ id, serviceId }: { id: string, serviceId: number }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch(); // Get the dispatch function

    useEffect(() => {
        const term = new Terminal();
        if (terminalRef.current) {
            window.electron.ipcRenderer.on('service-terminal-data', (event, {
                serviceId: receivedServiceId,
                terminalId,
                data
            }) => {
                if (receivedServiceId === serviceId && terminalId === id) {
                    term.write(data);
                }
            })
            term.open(terminalRef.current);
            term.onData((data) => {
                window.electron.ipcRenderer.send('service-terminal-data', {
                    serviceId,
                    terminalId: id,
                    data
                });
            });
        }
    }, []);

    const handleClose = () => {
        dispatch(deleteTerminalAction(serviceId, id) as any); // Dispatch the action
    };

    return (
        <div id={id} style={{ width: '100%', height: '100%' }}>
            <div ref={terminalRef}></div>
            <button onClick={handleClose}>Close</button> {/* Add the close button */}
        </div>
    );
};

const TerminalsList = ({ terminals, serviceId }: { terminals: string[], serviceId: number }) => {
    return (
        <div className='flex flex-row'>
            {terminals.map((terminal, index) => (
                <TerminalItem key={index} id={terminal} serviceId={serviceId} />
            ))}
        </div>
    );
};

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


    const openTerminal = async (service: DBService) => {
        dispatch(createTerminalAction(service.id as number) as any as UnknownAction);
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
                                <Accordion.Header>
                                    {service.name}
                                </Accordion.Header>
                                <Accordion.Body className='w-full flex justify-content-between'>
                                    <Container>
                                        <Row>
                                            <Col>
                                                <p>Directory: {service.directoryPath}</p>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <p>Terminals: {service.terminals.length}</p>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Button
                                                    onClick={() => {
                                                        dispatch(deleteServiceAction(service.id as number) as any as UnknownAction);
                                                    }}
                                                    variant="danger"
                                                >
                                                    Delete Service
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => {
                                                        openTerminal(service);
                                                    }}
                                                >New Terminal</Button>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <TerminalsList
                                                serviceId={service.id as number}
                                                terminals={service.terminals}
                                            />
                                        </Row>
                                    </Container>
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
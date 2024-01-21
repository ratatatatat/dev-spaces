import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Container, Row, Col } from 'react-bootstrap';
import { initiateServicesAction, selectServices } from './redux/slices/service';
import ServiceForm from './components/ServiceForm';
import TerminalsList from './components/TerminalList';
import ServiceActionBar from './components/ServiceActionBar';
import { DBService } from '../Types';

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


const App = () => {
    const dispatch = useDispatch();
    const services = useSelector(selectServices);

    useEffect(() => {
        dispatch(initiateServicesAction() as any);
    }, []); // dispatch is stable and won't cause unnecessary re-renders


    return (
        <Container>
            <Row>
                <Col>
                    <ServiceForm />
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
                                            <Col xs={12} className='my-2'>
                                                <b>{service.directoryPath}</b>                       
                                            </Col>
                                            <Col xs={12}>
                                                <ServiceActionBar service={service} />
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
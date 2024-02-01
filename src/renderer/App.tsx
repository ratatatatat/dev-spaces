import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Container, Row, Col } from 'react-bootstrap';
import { initiateServicesAction, selectServices } from './redux/slices/service';
import ServiceForm from './components/ServiceForm';
import TerminalsList from './components/TerminalList';
import ServiceActionBar from './components/ServiceActionBar';
import { DBService } from '../Types';
import Layout from './components/Dashboard';
import ContributeCard from './components/ContributionBar';

declare global {
    interface Window {
        electron: {
            ipcRenderer: {
                send: (channel: string, data: any) => void;
                on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
            };
            getServerPort: () => Promise<number>;
        };
    }
}

const LeftSection = () => {
    return <div className='flex h-full flex-col justify-between'>
        <ServiceForm />
        <ContributeCard />
    </div>
};

const RightSection = () => {
    const services = useSelector(selectServices);
    return <>
            <Row>
                <Col>
                    <h2>Spaces</h2>
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
    </>
};


const App = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(initiateServicesAction() as any);
    }, []); // dispatch is stable and won't cause unnecessary re-renders
    return (
        <Layout
            leftSection={<LeftSection />}
            rightSection={<RightSection />}
        />
    );
};

export default App;
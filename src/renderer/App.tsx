import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Accordion, Container, Row, Col, Button } from 'react-bootstrap';
import { initiateServicesAction, selectServices, updateServiceAction } from './redux/slices/service';
import ServiceForm from './components/ServiceForm';
import TerminalsList from './components/TerminalList';
import ServiceActionBar from './components/ServiceActionBar';
import Layout from './components/Dashboard';
import ContributeCard from './components/ContributionBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSave } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import { ServiceWithTerminals } from '../Types';
import 'react-quill/dist/quill.bubble.css'; // import the styles

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

const ServiceContainer = ({
    service,
}: {
    service: ServiceWithTerminals;
}) => {
    const dispatch = useDispatch();
    const [isEditting, setIsEditting] = React.useState(false);
    const [notes, setNotes] = React.useState(service.notes || '');
    const updateNotes = (service: ServiceWithTerminals) => {
        const updatedService = {
            ...service,
            notes,
        }
        dispatch(updateServiceAction(service.id, updatedService) as any);
    }
    const editorClassName = !isEditting ? 'react-quill-read-only' : '';
    return (
        <Container style={{overflow: 'scroll'}}>
            <Row>
                <Col xs={12} className="my-2">
                    {
                        isEditting ? <Button onClick={() => {
                            setIsEditting(false)
                            updateNotes(service);
                        }}>
                            Save Notes
                            <FontAwesomeIcon className='mx-2' color="white" size='sm' icon={faSave} />
                        </Button> 
                        : <Button onClick={() => setIsEditting(true)}>
                            Edit Notes 
                            <FontAwesomeIcon className="mx-2" color="white" size='sm' icon={faEdit} />
                        </Button>
                    }
                </Col>

                <Col xs={12}>
                    <ReactQuill
                        className={editorClassName}
                        theme={'bubble'}
                        readOnly={!isEditting}
                        value={notes}
                        placeholder='Add notes here...'
                        onChange={(notes: string) => setNotes(notes)}
                    />
                </Col>
            </Row>
            <Row style={{marginTop: '40px'}}>
                <Col xs={12} className="my-2">
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
    );
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
                                    <ServiceContainer service={service} />
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
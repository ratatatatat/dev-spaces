import { faFolder, faCode, faTerminal, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'react-bootstrap';
import { createTerminalAction, deleteServiceAction } from '../../redux/slices/service';
import { UnknownAction } from '@reduxjs/toolkit';
import { DBService } from '../../../Types';
import { useDispatch } from 'react-redux';

const ServiceActionBar = ({service}: { service: DBService}) => {
    const dispatch = useDispatch();
    const openTerminal = async (service: DBService) => {
        dispatch(createTerminalAction(service.id as number) as any as UnknownAction);
    }

    const openCode = async (service: DBService) => {
       window.electron.ipcRenderer.send('open-code', service);
    }

    const openFolder = async (service: DBService) => {
        window.electron.ipcRenderer.send('open-directory', service);
    }

    const deleteService = async (service: DBService) => {
        dispatch(deleteServiceAction(service.id as number) as any as UnknownAction);
    }
    return <div className='flex justify-between w-full'>
                <div>
                    <Button
                        variant='secondary'
                        onClick={() => {
                            openFolder(service);
                        }}
                    >
                        <FontAwesomeIcon icon={faFolder} />
                    </Button>
                    <Button
                        variant="info"
                        className="mx-2"
                        onClick={() => {
                            openCode(service);
                        }}
                    >
                        <FontAwesomeIcon icon={faCode} />
                    </Button>
                    <Button 
                        variant="dark"
                        onClick={() => {
                            openTerminal(service);
                        }}
                    >
                        <FontAwesomeIcon icon={faTerminal} />
                    </Button>
                </div>
                <div>
                    <Button
                        onClick={() => {
                            deleteService(service);
                        }}
                        variant="danger"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                </div>
        </div>
};

export default ServiceActionBar;
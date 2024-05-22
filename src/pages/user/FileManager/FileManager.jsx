import React, { useEffect, useState } from 'react';
import Backendless from 'backendless';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { Link } from 'react-router-dom';

const FileManager = () => {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDir, setCurrentDir] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [shareLogin, setShareLogin] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [fileToShare, setFileToShare] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        Backendless.UserService.getCurrentUser()
            .then(currentUser => {
                setUser(currentUser);
            })
            .catch(error => {
                console.error('Error getting current user:', error);
            });
    }, []);

    useEffect(() => {
        if (user) {
            fetchFiles(currentDir);
        }
    }, [user, currentDir]);

    const fetchFiles = async (dir) => {
        if (!user) {
            console.error('User is not loaded yet');
            return;
        }

        setLoading(true);
        try {
            const path = `/user_files/${user.login}/${dir}`;
            const fileListing = await Backendless.Files.listing(path);
            const files = fileListing.filter(file => file.name.includes('.'));
            const directories = fileListing.filter(file => !file.name.includes('.'));
            setFiles(files);
            setDirectories(directories);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (fileName) => {
        if (!user) {
            console.error('User is not loaded yet');
            return;
        }

        try {
            const filePath = `/user_files/${user.login}/${currentDir}/${fileName}`;
            await Backendless.Files.remove(filePath);
            await fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleCreateFolder = async () => {
        if (!user) {
            console.error('User is not loaded yet');
            return;
        }

        try {
            const path = `/user_files/${user.login}/${currentDir}/${newFolderName}`;
            await Backendless.Files.createDirectory(path);
            setNewFolderName('');
            await fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const handleUploadFile = async (event) => {
        if (!user) {
            console.error('User is not loaded yet');
            return;
        }

        const file = event.target.files[0];
        const path = `/user_files/${user.login}/${currentDir}/${file.name}`;
        try {
            await Backendless.Files.upload(file, path);
            await fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    const handleDirectoryClick = (dirName) => {
        setCurrentDir(currentDir ? `${currentDir}/${dirName}` : dirName);
    };

    const handleBackClick = () => {
        const dirs = currentDir.split('/');
        dirs.pop();
        setCurrentDir(dirs.join('/'));
    };

    const handleOpenShareModal = (file) => {
        setIsShareModalOpen(true);
        setFileToShare(file);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareLogin('');
        setFileToShare('');
    };

    const handleShareFile = async () => {
        if (!user) {
            console.error('User is not loaded yet');
            return;
        }

        try {
            const whereClause = `login = '${shareLogin}'`;
            const queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
            const userExists = await Backendless.Data.of("Users").find(queryBuilder);
            if (userExists.length === 0) {
                alert('Користувача не існує');
                return;
            }
            const pathToSave = `/user_files/${shareLogin}/shared_with_me`;
            const downloadLink = fileToShare.publicUrl;
            await Backendless.Files.saveFile(pathToSave, fileToShare.name + '.txt', downloadLink, true);
            alert('Файл успішно передано');
        } catch (error) {
            console.error('Failed to share file:', error);
        } finally {
            handleCloseShareModal();
        }
    };

    const handleDownloadFile = async (file) => {
        if (currentDir.includes('shared_with_me')) {
            const response = await axios.get(file.publicUrl);
            const link = response.data;
            window.open(link, "_blank");
        } else {
            window.open(file.publicUrl, "_blank");
        }
    };

    const handleExitClick = () => {
        Backendless.UserService.logout().then(() => navigate('/'));
    };

    const handleRefresh = () => {
        fetchFiles(currentDir);
    };

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between">
                <Link to="/after-login">
                    <button className="btn btn-primary btn-block">Попередня сторінка</button>
                </Link>
                <button className="btn btn-secondary" onClick={handleExitClick}>Вийти з системи</button>
                <h2>Управління файлами ({user?.login})</h2>
            </div>
            <h4>Директорія: {currentDir}</h4>
            <div className="mb-3">
                <button className="btn btn-primary mr-2" onClick={handleRefresh}>Оновити сторінку</button>
                {currentDir && <button className="btn btn-secondary ml-2" onClick={handleBackClick}>Назад</button>}
            </div>
            {isShareModalOpen && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Поділитися файлом</h5>
                                <button type="button" className="close" onClick={handleCloseShareModal}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control mb-3"
                                    value={shareLogin}
                                    onChange={e => setShareLogin(e.target.value)}
                                    placeholder="Ім'я користувача"
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={handleShareFile}>Поділитися</button>
                                <button className="btn btn-secondary" onClick={handleCloseShareModal}>Закрити</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control mb-2"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="Ім'я нової папки"
                />
                <button className="btn btn-success mb-2" onClick={handleCreateFolder}>Створити папку</button>
                <input type="file" className="form-control-file mb-2" onChange={handleUploadFile} />
            </div>
            <ul className="list-group">
                {directories.map(dir => (
                    <li key={dir.name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{dir.name}</span>
                        <div>
                            {dir.name !== 'shared_with_me' &&
                                <button className="btn btn-danger btn-sm mr-2" onClick={() => handleDelete(dir.name)}>Видалити</button>}
                            <button className="btn btn-info btn-sm" onClick={() => handleDirectoryClick(dir.name)}>Відкрити</button>
                        </div>
                    </li>
                ))}
                {files.map(file => (
                    <li key={file.name} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{file.name}</span>
                        <div>
                            <button className="btn btn-danger btn-sm mr-2" onClick={() => handleDelete(file.name)}>Видалити</button>
                            {currentDir !== 'shared_with_me' &&
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleOpenShareModal(file)}>Поділитися</button>}
                            <button className="btn btn-success btn-sm" onClick={() => handleDownloadFile(file)}>Завантажити</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileManager;

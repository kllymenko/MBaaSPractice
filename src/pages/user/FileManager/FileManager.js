import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router";
import axios from 'axios';

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDir, setCurrentDir] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [shareLogin, setShareLogin] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [fileToShare, setFileToShare] = useState('');
    const user = Backendless.UserService.currentUser;
    const navigate = useNavigate();

    useEffect(() => {
        fetchFiles(currentDir);
    }, [currentDir]);

    const fetchFiles = async (dir) => {
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
        try {
            const filePath = `/user_files/${user.login}/${currentDir}/${fileName}`;
            await Backendless.Files.remove(filePath);
            await fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleCreateFolder = async () => {
        try {
            const path = `/user_files/${user.login}/${currentDir}/${newFolderName}`;
            await Backendless.Files.createDirectory(path)
            setNewFolderName('')
            await fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const handleUploadFile = async (event) => {
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
        try {
            const whereClause = "login = '" + shareLogin + "'";
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
    }

    const handleExitClick = () => {
        Backendless.UserService.logout().then(navigate('/'))
    };

    const handleRefresh = () => {
        fetchFiles(currentDir);
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Управління файлами ({user?.login})</h2>
            <h4>Директорія: {currentDir}</h4>
            <button onClick={handleRefresh}>Оновити сторінку</button>
            {isShareModalOpen && (
                <div>
                    <input type="text" value={shareLogin} onChange={e => setShareLogin(e.target.value)}
                           placeholder="Ім'я користувача"/>
                    <button onClick={handleShareFile}>Поділитися</button>
                    <button onClick={handleCloseShareModal}>Закрити</button>
                </div>
            )}
            <button onClick={() => handleExitClick()}>Вийти з системи</button>
            {currentDir && <button onClick={handleBackClick}>Назад</button>}
            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                   placeholder="Ім'я нової папки"/>
            <button onClick={handleCreateFolder}>Створити папку</button>
            <input type="file" onChange={handleUploadFile}/>
            <ul>
                {directories.map(dir => (
                    <li key={dir.name}>
                        <span>{dir.name}</span>
                        {dir.name !== 'shared_with_me' &&
                            <button onClick={() => handleDelete(dir.name)}>Видалити</button>}
                        <button onClick={() => handleDirectoryClick(dir.name)}>Відкрити</button>
                    </li>
                ))}
                {files.map(file => (
                    <li key={file.name}>
                        <span>{file.name}</span>
                        <button onClick={() => handleDelete(file.name)}>Видалити</button>
                        {currentDir !== 'shared_with_me' &&
                            <button onClick={() => handleOpenShareModal(file)}>Поділитися</button>}
                        <button onClick={() => handleDownloadFile(file)}>Завантажити</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileManager;
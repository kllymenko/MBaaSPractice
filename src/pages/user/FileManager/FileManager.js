import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router";

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDir, setCurrentDir] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [shareUsername, setShareUsername] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [fileToShare, setFileToShare] = useState(null);
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
            fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleCreateFolder = async () => {
        try {
            const path = `/user_files/${user.login}/${currentDir}/${newFolderName}`;
            await Backendless.Files.createDirectory(path)
            fetchFiles(currentDir);
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const handleUploadFile = async (event) => {
        const file = event.target.files[0];

        const path = `/user_files/${user.login}/${currentDir}/${file.name}`;
        try {
            await Backendless.Files.upload(file, path);
            fetchFiles(currentDir);
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

    const handleOpenShareModal = (fileName) => {
        setFileToShare(fileName);
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setShareUsername('');
        setFileToShare(null);
    };

    const handleShareFile = async () => {
        try {
            const userExists = await Backendless.Data.of(Backendless.User).find({condition: `login = '${shareUsername}'`});
            if (userExists.length === 0) {
                alert('Користувача не існує');
                return;
            }

            const filePath = `/user_files/${shareUsername}/shared_with_me/${fileToShare}.txt`;
            const fileLink = `/user_files/${user.login}/${currentDir}/${fileToShare}`;
            await Backendless.Files.saveFile(filePath, fileLink, true);
            alert('Файл успішно поділено');
        } catch (error) {
            console.error('Failed to share file:', error);
        } finally {
            handleCloseShareModal();
        }
    };

    const handleOpenSharedFile = async (fileName) => {
        try {
            const filePath = `/user_files/${user.login}/shared_with_me/${fileName}`;
            const fileLink = await Backendless.Files.loadFile(filePath);
            window.open(fileLink);
        } catch (error) {
            console.error('Failed to open shared file:', error);
        }
    };

    const handleExitClick = () => {
        Backendless.UserService.logout().then(r => navigate('/'))

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
            <button onClick={handleRefresh}>Оновити сторінку</button>
            {isShareModalOpen && (
                <div>
                    <input type="text" value={shareUsername} onChange={e => setShareUsername(e.target.value)}
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
                        <button onClick={() => handleOpenShareModal(file.name)}>Поділитися</button>
                        <a href={file.publicUrl} download>Скачати</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileManager;
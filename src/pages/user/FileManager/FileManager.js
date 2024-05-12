import React, {useEffect, useState} from 'react';
import Backendless from 'backendless';
import {useNavigate} from "react-router";

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [directories, setDirectories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDir, setCurrentDir] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
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

    const handleExitClick = () => {
        Backendless.UserService.logout().then(r => navigate('/'))

    };


    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Управління файлами</h2>
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
                        <a href={file.publicUrl} download>Скачати</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FileManager;
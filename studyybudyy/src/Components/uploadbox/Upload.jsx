import React, { useState } from 'react';
import Api from '../../api'
import { MonitorUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const tSuccess = () => {toast.success('Successfully uploaded file!',
  {
    icon: '👏',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  }
)

};

const tError = () => toast.error('got error while uploading file!',
  {
    icon: '👏',
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
    },
  }
);


const Upload = ({setisuploadComp}) => {
  // 1. Initialize state for the file and description
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  
  function hideUpload(){
    setisuploadComp(false)
  }

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file.");

    // 2. Create FormData instance
    const formData = new FormData();
    
    // 3. Append your data (file and description)
    formData.append("file", selectedFile);
    formData.append("description", description);

    try {
      // 4. Send POST request with Axios
      const response = await Api.post('upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Essential for files
        },
      });
      console.log("Success:", response.data);
      tSuccess()
      hideUpload()
    } catch (error) {
      console.error("Upload error:", error);
      tError()
    }
  };

  return (
      <div className='uploadmodal'>
        <div className='uploadmodal-body'>
          <div className='uploadmodal-header'>
            <div>
              <MonitorUp size={16} color="#f90101" strokeWidth={2} />
            </div>
            <div> Upload Document for Q&A</div>
          </div>
          <div className='uploadmodal-form'>
            <div className={`form-group`}>
              <label htmlFor="fileinput">Upload file :</label>
              <div className={`flex-1`}>
                {/* 5. Bind the file input */}
                <input type="file" id="fileinput" onChange={handleFileChange} />
              </div>
            </div>
            <div className={`form-group`}>
              <label htmlFor="filedescription">Description :</label>
              <div className={`flex-1`}>
                {/* 6. Bind the textarea */}
                <textarea 
                  id="filedescription" 
                  rows="10" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
          <div className='uploadmodal-footer'>
            <button className={`uploadbtn`} onClick={handleUpload}>Upload</button>
            <button className={`cancelbtn`} onClick={hideUpload}>Cancel</button>
            <Toaster position="top-right" reverseOrder={false} />
          </div>
        </div>
      </div>
  );
};

export default Upload;
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const PostModal = ({ post }) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="link" onClick={handleShow}>
        View Post
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{post.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{post.content}</p>
          {post.img && <img src={`data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(post.img)))}`} alt="Post Image" className="img-fluid" />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostModal;

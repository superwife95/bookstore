import { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import { getData, postFormData } from "./fetch";
import Model from "./modal";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const FormData = require('form-data')
export default function Offcanva(props) {
  const [authors, setAuthors] = useState();
  const [generes, setGenere] = useState();
  const [loading, setloading] = useState(false);
  const [to, setToast] = useState(false);
  const [add, setAdd] = useState("");
  const [error, setError] = useState({});
  const[upload,setUpload]=useState(false)
  const [book, setBook] = useState({ title: "", price: "", publication_date: "", book_image: "", AuthorAuthorId: "", GenreGenreId: "" })
  useEffect(() => {
    LoadData();
  }, []);
  function handleClose() {
    setToast(false);
    LoadData();
  }
  async function LoadData() {
    setloading(true);
    if (props.id > 0) {
      const b = await getData(`http://localhost:3000/books/${props.id}`, "get");
      setBook(b);
    }
    const author = await getData("http://localhost:3000/authors/", "get");
    const genere = await getData("http://localhost:3000/generes/", "get");
    setGenere(genere);
    setAuthors(author);
    setloading(false);
  }
  const [type, setType] = useState("text");
  async function AddBook(id) {
      let error = {};
      if (book.title === '') {
        error.title = "Book's Title SHouldnt be Empty";
      }
      else if (book.price === '') {
        error.price = "Book's Price SHouldnt be Empty";
      }
      else if (book.publication_date === '') {
        error.pd = "Book's Publication Date SHouldnt be Empty";
      }
      else if (book.AuthorAuthorId === '') {
        error.aid = "Please Select Author of the Book";
      }
      else if (book.GenreGenreId === '') {
        error.gid = "Please Select Book's Genere";
      }
      else {
        var data = new FormData();
        Object.entries(book).forEach(([key, value]) => {
          if (value !== '' && value!==null) {
            data.set(key, value);
          }
        });
        let msg;
        if(props.id>0){
          delete book.Author;
          delete book.Genre;
           msg = await postFormData(`http://localhost:3000/books/${props.id}`, "put", data);
        }
        else{
          msg = await postFormData("http://localhost:3000/books/", "post", data);
        }
        if (msg.hasOwnProperty('msg')) {
          toast.error(msg.msg, {
            onClose: () => props.onClick()
          });

        }
        else if (msg.hasOwnProperty('book_id')) {
          let message
          if(props.id>0){
            message="Book Updated Successfully";
          }
          else{
            message="Book Created Successfully";
          }
          toast.success(message, {
            onClose: () => { props.onClick(); props.onload() }
          });
        }
        else {
          toast.error("Something Went Wrong", {
            onClose: () => props.onClick()
          });

        }
      }
      setError(error);
  }
  function handleChange(event) {
    if (event.target.name === 'book_image') {
      setBook({ ...book, [event.target.name]: event.target.files[0] })
    }
    else {
      setBook({ ...book, [event.target.name]: event.target.value })
    }
  }
  return (
    <Offcanvas show={props.show} placement="end">
      <Offcanvas.Header>
        <Offcanvas.Title>
          <h3 className="h3">{props.id > 0 ? "Edit Book" : "Add Book"}</h3>
        </Offcanvas.Title>
        <span className="btn-close" style={{ float: "right !important" }} onClick={props.onClick}></span>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="container">
          <div className="row">
            {loading ?
              <div className="row">
                <div className="spinner-grow sp col-6 offset-6" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
              :
              <Form className="mt-5">
                <Form.Control name="title" placeholder="Enter Book Name" className="mt-2" onChange={handleChange} value={book.title} />

                {error.title && <h1 className="text-danger mt-2 h6">{error.title}</h1>}

                <Form.Control name="price" type="number" placeholder="Enter Price of book" className="mt-3" onChange={handleChange} 

                min="1" value={book.price} step="0.10"/>

                {error.price && <h1 className="text-danger mt-2 h6">{error.price}</h1>}

                <Form.Control name="publication_date" type={type} placeholder="Enter Publication Date"
                  onFocus={() => setType("date")} className="mt-3" onChange={handleChange} value={book.publication_date} />

                {error.pd && <h1 className="text-danger mt-2 h6">{error.pd}</h1>}
                {props.id>0 ?
                    (book.book_image===null  ? <h1 className="text-dark mt-2 h6">Image was not uploaded</h1> :
                    typeof book.book_image==='object' ? ""
                   : <img src={book.book_image} alt="no" height="100" width="100" className="mt-2" />):""
                }
                {props.id>0 && 
                  <Link to="#" type="btn"
                  onClick={()=>setUpload(true)} className="mt-2">Upload New Image</Link>
                }
               {(props.id===0 || upload===true) &&
                <Form.Control type="file" accept="image/*" name="book_image" placeholder="Select Image" className="mt-3" onChange={handleChange} />}

                <Form.Select name="AuthorAuthorId" className="mt-3" onChange={handleChange} value={book.AuthorAuthorId}>
                  <option value="">Select Author</option>
                  {authors && authors.map(e =>
                    <option value={e.author_id} key={e.author_id}>{e.name}</option>
                  )}
                </Form.Select>

                {error.aid && <h1 className="text-danger mt-2 h6">{error.aid}</h1>}

                <p className="mt-3">Couldn't find the Author You Want ? <Link to="#" type="btn"
                  onClick={() => { setToast(true); setAdd("addAuthor") }}> Click Here</Link></p>

                <Form.Select name="GenreGenreId" className="mt-3" onChange={handleChange} value={book.GenreGenreId}>
                  <option value="">Select Genere</option>
                  {generes && generes.map(e =>
                    <option value={e.genre_id} key={e.genre_id}>{e.genre_name}</option>
                  )}
                </Form.Select>

                {error.gid && <h1 className="text-danger mt-2 h6">{error.gid}</h1>}

                <p className="mt-3">Couldn't find the Genere You Want ? <Link to="#" type="btn"
                  onClick={() => { setToast(true); setAdd("genere") }}> Click Here</Link></p>

                <Button type="submit" as={Col} xs={{ span: 4, offset: 4 }} className="mt-5" onClick={() => AddBook(props.id)}>{props.id > 0 ? "Edit Book" : "Add Book"}</Button>
              </Form>}

            {to && <Model show={toast} onClick={handleClose} type={add} close={handleClose} />}
          </div>
        </div>
      </Offcanvas.Body>
      <ToastContainer position="top-center" />
    </Offcanvas>
  )
}
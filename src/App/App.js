import React, { Component } from 'react'
import { Route, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NoteListNav from '../NoteListNav/NoteListNav'
import NotePageNav from '../NotePageNav/NotePageNav'
import NoteListMain from '../NoteListMain/NoteListMain'
import NotePageMain from '../NotePageMain/NotePageMain'
import AddFolder from '../AddFolder/AddFolder'
import AddNote from '../AddNote/AddNote'
import { getNotesForFolder, findNote, findFolder } from '../notes-helpers'
import './App.css'
import OurContext from '../MainContext';

class App extends Component {
  state = {
    notes: [],
    folders: [],
  };

  static contextType = OurContext

  componentDidMount() {
    this.getData().then(data=>this.setState(data))
  }

  getData = async () =>{
    const res = await Promise.all([fetch('http://localhost:9090/folders'), fetch('http://localhost:9090/notes')])
    const [folders, notes] =  await Promise.all(res.map(res => res.json()))
    return {folders, notes}
  }

  renderNavRoutes() {
    console.log(this.context)
    return (
      <>
        {['/', '/folder/:folderId'].map(path =>
          <Route
            exact
            key={path}
            path={path}
            render={routeProps =>
              <NoteListNav
                {...routeProps}
              />
            }
          />
        )}
        <Route
          path='/note/:noteId'
          render={routeProps => {
            const { noteId } = routeProps.match.params
            const note = findNote(this.context.notes, noteId) || {}
            
            const folder = findFolder(this.context.folders, note.folderId)
            return (
              <NotePageNav
                {...routeProps}
                folder={folder}
              />
            )
          }}
        />
        <Route
          path='/add-folder'
          component={NotePageNav}
        />
        <Route
          path='/add-note'
          component={NotePageNav}
        />
      </>
    )
  }

  handleDelete = (noteId, location) => {
    let data//const newNotes = this.state.notes.filter(note => note.Id !== noteId )
    console.log(location)
    fetch(`http://localhost:9090/notes/${noteId}`,{
      method: 'DELETE'
    })
    .then(()=>{
     this.getData().then((data)=>this.setState(data)) 
    }).then(()=>{
      if (location && location.match.path ==="/note/:noteId") {
        location.history.goBack();
      }
    })
  }

  renderMainRoutes() {
   
    const { notes } = this.state
    return (
      <>
        {['/', '/folder/:folderId'].map(path =>
          <Route
            exact
            key={path}
            path={path}
            render={routeProps => {
              const { folderId } = routeProps.match.params
              const notesForFolder = getNotesForFolder(notes, folderId)
              return (
                <NoteListMain
                  {...routeProps}
                  notes={notesForFolder}
                />
              )
            }}
          />
        )}
        <Route
          path='/note/:noteId'
          render={routeProps => {
            const { noteId } = routeProps.match.params
            const note = findNote(notes, noteId)
            return (
              <NotePageMain
                 {...routeProps}
                note={note}
              />
            )
          }}
        />
        <Route
          path='/add-folder'
          component={AddFolder}
        />
        <Route
          path='/add-note'
          render={routeProps => {
            return (
              <AddNote
                {...routeProps}
                
              />
            )
          }}
        />
      </>
    )
  }

  render() {
    console.log(this.context)

    const something = { notes: this.state.notes, folders: this.state.folders, delete: this.handleDelete}
      return (
       <OurContext.Provider value={something}>
        <div className='App'>
          <nav className='App__nav'>

            {this.renderNavRoutes()}
          </nav>
          <header className='App__header'>
            <h1>
              <Link to='/'>Noteful</Link>
              {' '}
              <FontAwesomeIcon icon='check-double' />
            </h1>
          </header>
          <main className='App__main'>
            {this.renderMainRoutes()}
          </main>
        </div>
        </OurContext.Provider>
    )
  }
}
export default App

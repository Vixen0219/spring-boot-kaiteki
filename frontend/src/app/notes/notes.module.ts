import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesRoutingModule } from './notes-routing.module';
import { NotesComponent } from './pages/notes/notes.component';
import { SharedModule } from '../shared/shared.module';
import { NotesSidebarComponent } from './components/notes-sidebar/notes-sidebar.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [NotesComponent, NotesSidebarComponent],
  imports: [CommonModule, SharedModule, NotesRoutingModule, CKEditorModule, ReactiveFormsModule],
})
export class NotesModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column.component';
import { KanbanItemComponent } from './components/kanban-item/kanban-item.component';
import { TasksFilterComponent } from './components/tasks-filter/tasks-filter.component';
import { TasksRoutingModule } from './tasks-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TasksListComponent } from './pages/tasks-list/tasks-list.component';
import { TasksCustomizeComponent } from './pages/tasks-customize/tasks-customize.component';
import { TaskEditComponent } from './pages/task-edit/task-edit.component';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { TaskCreateComponent } from './pages/task-create/task-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskDetailsSidebarComponent } from './components/task-details-sidebar/task-details-sidebar.component';

@NgModule({
  declarations: [
    TasksListComponent,
    KanbanBoardComponent,
    KanbanColumnComponent,
    KanbanItemComponent,
    TasksFilterComponent,
    TasksCustomizeComponent,
    TaskEditComponent,
    TaskViewComponent,
    TaskCreateComponent,
    TaskDetailsSidebarComponent,
  ],
  imports: [CommonModule, TasksRoutingModule, SharedModule, DragDropModule, ReactiveFormsModule],
})
export class TasksModule {}

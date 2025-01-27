import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'

import { EMPTY, catchError, switchMap, take, throwError } from 'rxjs'

import { ToastService } from 'src/app/shared/services/toast.service'

import { CreateTaskDTO } from 'src/app/teams/submodules/tasks/models/create-task.dto'
import { Task, TaskStatus } from 'src/app/teams/submodules/tasks/models/tasks.model'
import { TasksService } from 'src/app/teams/submodules/tasks/services/tasks.service'

import {
	CreateTaskDialogComponent,
	CreateTaskDialogComponentProps,
} from '../../../../dialogs/create-task-dialog/create-task-dialog.component'

@Component({
	selector: 'app-kanban-column[column]',
	templateUrl: './kanban-column.component.html',
	styleUrls: ['./kanban-column.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
	@Input() column!: TaskStatus
	@Input() connectedColumns: string[] = []

	constructor(
		private tasksService: TasksService,
		private toastrService: ToastService,
		private dialog: MatDialog,
	) {}

	onDrop(event: CdkDragDrop<Task[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
		} else {
			const taskId = event.item.data.id
			const currentStatusId = event.container.id

			const numberedTaskId = Number(taskId)
			const numberedStatusId = Number(currentStatusId)

			if (isNaN(numberedStatusId) || isNaN(numberedTaskId)) {
				this.toastrService.open('The current status or task id is not a number')

				return
			}

			transferArrayItem(
				event.previousContainer.data,
				event.container.data,
				event.previousIndex,
				event.currentIndex,
			)

			this.tasksService
				.updateTask(numberedTaskId, { statusId: numberedStatusId })
				.pipe(
					catchError(err => {
						this.toastrService.error('Failed to change status of task. Reload the page')
						return throwError(() => err)
					}),
					take(1),
				)
				.subscribe()
		}
	}

	onAddButtonClick(): void {
		const dialogRef = this.dialog.open<unknown, CreateTaskDialogComponentProps, CreateTaskDTO>(
			CreateTaskDialogComponent,
			{
				minWidth: '70%',
				data: {
					statusId: this.column.id,
				},
			},
		)

		dialogRef
			.afterClosed()
			.pipe(
				switchMap(value => {
					if (value) {
						return this.tasksService.createTask(value)
					}
					return EMPTY
				}),
				catchError(err => {
					this.toastrService.open('Failed to create a task')
					return throwError(() => err)
				}),
				take(1),
			)
			.subscribe(() => {
				this.toastrService.open('Successfully created task')
				this.tasksService.refetchTasks()
			})
	}

	get getColumnTasksCount() {
		return this.column.tasks.length
	}

	get getColumnBorderBottomStyle() {
		return `2px solid ${this.column.color}`
	}

	get getColumnStringId() {
		return `${this.column.id}`
	}
}

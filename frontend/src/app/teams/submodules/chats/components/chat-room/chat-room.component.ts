import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnDestroy,
	OnInit,
} from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'

import { EMPTY, Subject, catchError, switchMap, take, takeUntil, throwError } from 'rxjs'

import { ToastService } from 'src/app/shared/services/toast.service'

import { TeamsService } from 'src/app/teams/services/teams.service'

import { UpdateChatRoomDTO } from '../../models/chat-rooms.dto'
import { ChatRooms } from '../../models/chat-rooms.model'
import { CreateMessageDTO } from '../../models/message.dto'
import { ChatMessagesType } from '../../models/message.model'
import { ChatsService } from '../../services/chats.service'
import {
	UpdateChatDialogComponent,
	UpdateChatDialogComponentProps,
} from '../dialogs/update-chat-dialog/update-chat-dialog.component'

@Component({
	selector: 'app-chat-room',
	templateUrl: './chat-room.component.html',
	styleUrls: ['./chat-room.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoomComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>()

	@Input() includeBackButton = false

	currentChat$ = this.chatsService.currentChatRoom$
	messages$ = this.chatsService.currentChatRoomMessages$
	currentTeamMember$ = this.teamsService.currentTeamMember$

	form = new FormGroup({
		content: new FormControl<string>('', [
			Validators.required,
			Validators.maxLength(2048),
			Validators.minLength(1),
		]),
	})

	constructor(
		private chatsService: ChatsService,
		private toastService: ToastService,
		private dialog: MatDialog,
		private teamsService: TeamsService,
		private cd: ChangeDetectorRef,
	) {}

	ngOnInit() {
		this.chatsService
			.getHistoryMessages()
			.pipe(
				catchError(err => {
					this.toastService.error('Failed to get messages history')
					return throwError(() => err)
				}),
				takeUntil(this.unsubscribe$),
			)
			.subscribe(data => {
				this.chatsService.addMessage(data)
			})

		this.chatsService
			.subscribeCurrentChatMessages()
			.pipe(
				catchError(err => {
					this.toastService.error('Failed to receive messages')
					return throwError(() => err)
				}),
				takeUntil(this.unsubscribe$),
			)
			.subscribe(resp => {
				if (resp) {
					this.chatsService.addMessage(resp)
				}
			})

		this.scrollToBottom()
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next()
		this.unsubscribe$.complete()
	}

	scrollToBottom(): void {
		const element = document.getElementById('chatsContainerId')

		if (element) {
			element.scrollTop = element.scrollHeight
		}
	}

	onSendMessage() {
		const { content } = this.form.getRawValue()

		if (!content) {
			this.toastService.error('Missing content')
			return
		}

		this.currentTeamMember$
			.pipe(
				switchMap(member => {
					if (!member) {
						this.toastService.error('Missing member')
						return EMPTY
					}

					if (!content.trim()) {
						return EMPTY
					}

					const dto: CreateMessageDTO = {
						content: content.trim(),
						type: ChatMessagesType.TEXT,
						senderId: member.id,
					}

					return this.chatsService.sendMessageByCurrentChat(dto)
				}),
				catchError(err => {
					this.toastService.error('Failed to send message')
					return throwError(() => err)
				}),
				take(1),
			)
			.subscribe(() => {
				this.form.reset({ content: '' })
			})
	}

	onDeleteClick(chat: ChatRooms) {
		this.chatsService
			.deleteChatRoom(chat.id)
			.pipe(
				catchError(err => {
					this.toastService.error('Failed to delete chat')
					return throwError(() => err)
				}),
				take(1),
			)
			.subscribe(() => {
				this.toastService.open('Successfully deleted chat')
				this.chatsService.setCurrentChat(null)
				this.chatsService.refetchChats()
			})
	}

	onEditClick(chat: ChatRooms) {
		const dialogRef = this.dialog.open<unknown, UpdateChatDialogComponentProps, UpdateChatRoomDTO>(
			UpdateChatDialogComponent,
			{
				minWidth: '30%',
				data: {
					chat: chat,
				},
			},
		)

		dialogRef
			.afterClosed()
			.pipe(
				switchMap(form => {
					if (form) {
						return this.chatsService.updateChatRoom(chat.id, form)
					}

					return EMPTY
				}),
				switchMap(() => {
					return this.chatsService.getChatRoomById(chat.id)
				}),
				catchError(err => {
					this.toastService.error('Failed to update chat')
					return throwError(() => err)
				}),
				take(1),
			)
			.subscribe(updatedChat => {
				this.toastService.open('Successfully updated chat')
				this.chatsService.setCurrentChat(updatedChat)
				this.chatsService.refetchChats()
			})
	}
}

import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'

import { Subject, catchError, finalize, tap, throwError } from 'rxjs'

import { ToastService } from 'src/app/shared/services/toast.service'

import { SpotifyService } from '../../services/spotify.service'

@Component({
	selector: 'app-spotify-auth',
	templateUrl: './spotify-auth.component.html',
	styleUrls: ['./spotify-auth.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpotifyAuthComponent {
	private unsubscribe$ = new Subject<void>()

	isLoading = true
	isSuccess = false

	constructor(
		private spotifyService: SpotifyService,
		private route: ActivatedRoute,
		private cd: ChangeDetectorRef,
		private toastService: ToastService
	) {}

	ngOnInit(): void {
		this.handleAuth()
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next()
		this.unsubscribe$.complete()
	}

	private handleAuth() {
		const code = this.route.snapshot.queryParamMap.get('code')
		if (!code) return

		this.spotifyService
			.handleAuth(code)
			.pipe(
				tap(() => {
					this.isLoading = true
					this.isSuccess = false
				}),
				catchError(err => {
					this.isSuccess = false
					this.toastService.error('Failed to log in spotify')
					return throwError(() => err)
				}),
				finalize(() => {
					this.isLoading = false
					this.cd.markForCheck()
				})
			)
			.subscribe(() => {
				this.isSuccess = true
				this.toastService.open('Successfully integrated with spotify')
				this.cd.markForCheck()
			})
	}
}

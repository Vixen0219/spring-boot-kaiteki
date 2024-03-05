import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core'

import { EMPTY, Subject, catchError, takeUntil } from 'rxjs'

import { AuthService } from './auth/services/auth.service'

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>()
	isAuthLoading$ = this.authService.isAuthLoading$

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		this.authService
			.autoLogin()
			.pipe(
				takeUntil(this.unsubscribe$),
				catchError(err => {
					console.log(err)
					return EMPTY
				})
			)
			.subscribe()
	}

	ngOnDestroy(): void {
		this.unsubscribe$.next()
		this.unsubscribe$.complete()
	}
}

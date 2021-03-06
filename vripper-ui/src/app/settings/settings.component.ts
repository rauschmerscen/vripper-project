import {finalize} from 'rxjs/operators';
import {AppService} from '../services/app.service';
import {ClipboardService} from '../services/clipboard.service';
import {ChangeDetectionStrategy, Component, NgZone, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServerService} from '../services/server-service';
import {ElectronService} from 'ngx-electron';
import {Settings} from '../domain/settings.model';
import OpenDialogReturnValue = Electron.OpenDialogReturnValue;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  loading = false;
  darkTheme = false;

  viperGirlsSettingsForm = new FormGroup({
    vLogin: new FormControl(false),
    vUsername: new FormControl(''),
    vPassword: new FormControl(''),
    vThanks: new FormControl(false),
    leaveThanksOnStart: new FormControl(false)
  });

  downloadSettingsForm = new FormGroup({
    downloadPath: new FormControl(''),
    autoStart: new FormControl(false),
    forceOrder: new FormControl(false),
    subLocation: new FormControl(false),
    threadSubLocation: new FormControl(false),
    clearCompleted: new FormControl(false),
    appendPostId: new FormControl(false)
  });

  connectionSettingsForm = new FormGroup({
    maxThreads: new FormControl(''),
    maxTotalThreads: new FormControl(''),
    connectionTimeout: new FormControl(''),
    maxAttempts: new FormControl('')
  });

  desktopSettingsForm = new FormGroup({
    desktopClipboard: new FormControl(false)
  });

  constructor(
    private httpClient: HttpClient,
    private _snackBar: MatSnackBar,
    private serverService: ServerService,
    public electronService: ElectronService,
    private clipboardService: ClipboardService,
    private appService: AppService,
    private zone: NgZone
  ) {
  }

  updateTheme() {
    this.appService.updateTheme(this.darkTheme);
  }

  updateSettings(settings: Settings) {
    this.appService.updateSettings(settings);
  }

  ngOnInit() {
    this.darkTheme = this.appService.darkTheme;
    this.httpClient.get<Settings>(this.serverService.baseUrl + '/settings')
      .subscribe(data => {
        this.viperGirlsSettingsForm.reset(data);
        this.downloadSettingsForm.reset(data);
        this.connectionSettingsForm.reset(data);
        this.desktopSettingsForm.reset(data);
      }, error => {
        this._snackBar.open(error?.error?.message || 'Unexpected error, check log file', null, {
          duration: 5000
        });
      });
  }

  browse() {
    this.electronService.remote.dialog
      .showOpenDialog(this.electronService.remote.getCurrentWindow(), {
        properties: ['openDirectory']
      })
      .then((value: OpenDialogReturnValue) => {
        this.zone.run(() => {
          if (!value.canceled && value.filePaths !== undefined) {
            this.downloadSettingsForm.get('downloadPath').setValue(value.filePaths[0]);
            this.downloadSettingsForm.get('downloadPath').markAsDirty();
            this.downloadSettingsForm.get('downloadPath').markAsTouched();
          }
        });
      });
  }

  onSubmit(): void {
    this.loading = true;
    this.httpClient
      .post<Settings>(this.serverService.baseUrl + '/settings', {
        ...this.viperGirlsSettingsForm.value,
        ...this.downloadSettingsForm.value,
        ...this.connectionSettingsForm.value,
        darkTheme: this.darkTheme,
        ...this.desktopSettingsForm.value
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        data => {
          this._snackBar.open('Settings updated', null, {
            duration: 5000
          });
          this.viperGirlsSettingsForm.reset(data);
          this.downloadSettingsForm.reset(data);
          this.connectionSettingsForm.reset(data);
          this.desktopSettingsForm.reset(data);
          this.clipboardService.init(data);
          this.updateSettings(data);
        },
        error => {
          this._snackBar.open(error?.error?.message || 'Unexpected error, check log file', null, {
            duration: 5000
          });
        }
      );
  }
}

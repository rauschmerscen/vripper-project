import {SelectionService} from '../services/selection-service';
import {ChangeDetectionStrategy, Component, NgZone, OnDestroy} from '@angular/core';
import {PostsDataSource} from './posts.datasource';
import {WsConnectionService} from '../services/ws-connection.service';
import {GridOptions} from 'ag-grid-community';
import {Subject} from 'rxjs';
import {PostContextMenuService} from '../services/post-context-menu.service';
import {PostProgressRendererNative} from '../grid-custom-cells/post-progress-renderer.native';
import {PostStatusRendererNative} from '../grid-custom-cells/post-status-renderer.native';
import {PostFilesRendererNative} from '../grid-custom-cells/post-files-renderer.native';
import {PostAltRendererNative} from '../grid-custom-cells/post-alt-renderer.native';
import {TitleRendererNative} from '../grid-custom-cells/title-renderer.native';
import {Overlay, OverlayPositionBuilder} from '@angular/cdk/overlay';
import {PostsService} from '../services/posts.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnDestroy {
  dialogOpen: Subject<boolean> = new Subject();
  gridOptions: GridOptions;
  dataSource: PostsDataSource;

  constructor(
    private wsConnection: WsConnectionService,
    private zone: NgZone,
    private selectionService: SelectionService,
    private postsDataService: PostsService,
    private contextMenuService: PostContextMenuService,
    private overlayPositionBuilder: OverlayPositionBuilder,
    private overlay: Overlay
  ) {
    this.gridOptions = <GridOptions>{
      columnDefs: [
        {
          headerName: 'Title',
          field: 'title',
          cellRenderer: 'nativeTitleCellRenderer',
          cellRendererParams: {
            contextMenuService: this.contextMenuService,
            overlayPositionBuilder: this.overlayPositionBuilder,
            overlay: this.overlay,
            zone: this.zone
          },
          sort: 'asc',
          headerCheckboxSelection: true,
          headerCheckboxSelectionFilteredOnly: true,
          flex: 2
        }, {
          headerName: 'Progress',
          field: 'progress',
          cellRenderer: 'nativeProgressCellRenderer',
          cellRendererParams: {
            contextMenuService: this.contextMenuService
          },
          width: 250,
          maxWidth: 250
        }, {
          headerName: 'Status',
          field: 'status',
          cellRenderer: 'nativeStatusCellRenderer',
          cellRendererParams: {
            contextMenuService: this.contextMenuService
          },
          width: 150,
          maxWidth: 150
        }, {
          headerName: 'Images',
          field: 'done',
          cellRenderer: 'nativeFilesCellRenderer',
          cellRendererParams: {
            contextMenuService: this.contextMenuService
          },
          flex: 1
        }, {
          headerName: 'Alternative titles',
          field: 'metadata',
          cellRenderer: 'nativeAltCellRenderer',
          cellRendererParams: {
            contextMenuService: this.contextMenuService
          },
          flex: 1
        }
      ],
      defaultColDef: {
        sortable: true,
        resizable: true
      },
      rowHeight: 26,
      headerHeight: 35,
      animateRows: true,
      rowSelection: 'multiple',
      rowDeselection: true,
      rowData: [],
      components: {
        nativeProgressCellRenderer: PostProgressRendererNative,
        nativeStatusCellRenderer: PostStatusRendererNative,
        nativeFilesCellRenderer: PostFilesRendererNative,
        nativeAltCellRenderer: PostAltRendererNative,
        nativeTitleCellRenderer: TitleRendererNative,
      },
      overlayLoadingTemplate: '<span></span>',
      overlayNoRowsTemplate: '<span></span>',
      getRowNodeId: data => data['postId'],
      onGridReady: () => {
        this.dataSource = new PostsDataSource(this.wsConnection, this.gridOptions, this.zone);
        this.postsDataService.setGridApi(this.gridOptions.api);
        this.dataSource.connect();
      },
      onSelectionChanged: () => this.selectionService.onSelectionChanged(this.gridOptions.api.getSelectedNodes()),
      onBodyScroll: () => this.contextMenuService.closePostContextMenu()
    };
  }

  ngOnDestroy(): void {
    this.dataSource.disconnect();
  }
}

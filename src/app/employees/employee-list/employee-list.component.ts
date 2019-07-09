import { Component, OnInit, ViewChild } from '@angular/core';
import { EmployeeService } from 'src/app/shared/employee.service';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog, MatDialogConfig } from '@angular/material';
import { DepartmentService } from 'src/app/shared/department.service';
import { EmployeeComponent } from '../employee/employee.component';
import { NotificationService } from 'src/app/shared/notification.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  constructor(private service: EmployeeService,
    private departmentService:DepartmentService,
    private dialog:MatDialog,
    private notificationService: NotificationService,
    private dialogService: DialogService) { }

  listData : MatTableDataSource<any>;
  displayedColumns: string[] = ['fullName','email','mobile','city','departmentName','actions'];
  public searchKey="";
  @ViewChild(MatSort,{ read: false, static: false }) sort: MatSort; 
  @ViewChild(MatPaginator,{ read: false, static: false }) paginator:MatPaginator;

  ngOnInit() {
    this.service.getEmployees().subscribe(
      list =>{
        let array = list.map(item =>{
          let departmentName = this.departmentService.getDepartmentName(item.payload.val()['department']);
          //console.log(departmentName);
          return {
            $key:item.key,
            departmentName :departmentName,
            ...item.payload.val()
          }
        })

        this.listData = new MatTableDataSource(array);
        this.listData.sort = this.sort;
        this.listData.paginator = this.paginator;

        //for stop other search like date of hire
        this.listData.filterPredicate = (data, filter) => {
          return this.displayedColumns.some(ele => {
            return ele != 'actions' && data[ele].toLowerCase().indexOf(filter) != -1;
          });
        };
      }
    );
  }

  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter(){
    this.listData.filter = this.searchKey.trim().toLowerCase();
  }

  onCreate(){
    this.service.initializeFormGroup();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(EmployeeComponent,dialogConfig)
  }

  onEdit(row){
    console.log("hello");
    this.service.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "60%";
    this.dialog.open(EmployeeComponent,dialogConfig)
  }

  onDelete($key){
    this.dialogService.openConfirmDilaog('Are you sure to delete this record ?')
    .afterClosed().subscribe(res =>{
      if(res){
        this.service.deleteEmployee($key);
        this.notificationService.warn('! Deleted successfully');
      }
    });
  }
}

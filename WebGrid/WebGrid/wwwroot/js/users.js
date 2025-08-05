$(document).ready(function () {

    // Add search inputs to each footer cell
    $('#usersTable tfoot th').each(function () {
        var title = $(this).text();
        $(this).html('<input type="text" class="form-control form-control-sm" placeholder="Search ' + title + '" />');
    });

    // Initialize DataTable
    var table = $('#usersTable').DataTable({
        ajax: '/Users/GetUsers',
        columns: [
            { data: "FirstName" },
            { data: "LastName" },
            { data: "Email" },
            { data: "Contact" },
            { data: "VatNumber" },
            { data: "JobTitle" },
            { data: "OrganizationName" },
            { data: "Website" }
        ],
        pageLength: 10
    });

    // Apply the search
    table.columns().every(function () {
        var that = this;
        $('input', this.footer()).on('keyup change clear', function () {
            if (that.search() !== this.value) {
                that.search(this.value).draw();
            }
        });
    });

    $('#usersTable_wrapper .dataTables_filter').addClass('mb-3');

});

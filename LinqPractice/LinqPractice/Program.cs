using System;
using System.Linq;

namespace LinqPractice
{
    class Program
    {
        class Student
        {
            public int StudentID { get; set; }
            public String StudentName { get; set; }
            public int Age { get; set; }
        }

        static void Main(string[] args)
        {
            // simple linq query
            //string[] testData = { "test1", "test2", "test3" };
            //var linqQuery = from td in testData where td.Contains("t") select td;
            //foreach (var find in linqQuery)
            //    Console.WriteLine(find);

            // another simple query
            Student[] studentArray = {
            new Student() { StudentID = 1, StudentName = "John", Age = 18 },
            new Student() { StudentID = 2, StudentName = "Steve",  Age = 21 },
            new Student() { StudentID = 3, StudentName = "Bill",  Age = 25 },
            new Student() { StudentID = 4, StudentName = "Ram" , Age = 20 },
            new Student() { StudentID = 5, StudentName = "Ron" , Age = 31 },
            new Student() { StudentID = 6, StudentName = "Chris",  Age = 17 },
            new Student() { StudentID = 7, StudentName = "Rob",Age = 19  },
        };
            var lq2 = from student in studentArray where student.Age > 20 select student;
            foreach (var stud in lq2)
                Console.WriteLine(stud);





        }
    }
}

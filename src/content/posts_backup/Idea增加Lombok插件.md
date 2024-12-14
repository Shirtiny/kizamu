---
title: Lombok插件
date: 2019-08-01 22:42:18
tags:
  - java
  - 开发知识
  - IntelliJ IDEA
  - Lombok插件
categories: 学习经验
---

# 为IDE装上Lombok插件

Lombok提供了一套注解，可以大量的简化java代码。

Lombok支持Eclipse或Idea，需要先下载zip文件：[下载地址](https://github.com/mplushnikov/lombok-intellij-plugin/releases)

<!-- more -->

## IDEA

主要介绍下插件在Idea的使用

下载插件后在IDEA界面，右下角Configure，选Plugins

![](https://file.moetu.org/images/2019/08/01/40f0d2d4a6db18dee9f3d76dda5dbddef1373a30bf77316e.png)

进入插件界面后，点齿轮设置,选Install Plugin from Disk... 选刚刚下载插件的zip文件

![](https://file.moetu.org/images/2019/08/01/974dfe8ff9aed7b06c0fc3850e6ec0dd42f24cc5523861b1.png)

点重启IDEA。

重启后在Setting里设置：勾选Enable annotation processing

![](https://file.moetu.org/images/2019/08/01/25c1c1ad8857a02b94eac2bd273e45700ef7bddcba69e6ae.png)

最后，在项目中引入Lombok的jar包即可使用@Data等lombok注解

```xml
<!--    lombok    -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.10</version>
            <scope>provided</scope>
        </dependency>
```

## Lombok的文档

- [Introduction](http://jnb.ociweb.com/jnb/jnbJan2010.html#intro)
- [Installation](http://jnb.ociweb.com/jnb/jnbJan2010.html#installation)
- Lombok Annotations
  - [@Getter and @Setter](http://jnb.ociweb.com/jnb/jnbJan2010.html#gettersetter)
  - [@NonNull](http://jnb.ociweb.com/jnb/jnbJan2010.html#nonnull)
  - [@ToString](http://jnb.ociweb.com/jnb/jnbJan2010.html#tostring)
  - [@EqualsAndHashCode](http://jnb.ociweb.com/jnb/jnbJan2010.html#equals)
  - [@Data](http://jnb.ociweb.com/jnb/jnbJan2010.html#data)
  - [@Cleanup](http://jnb.ociweb.com/jnb/jnbJan2010.html#cleanup)
  - [@Synchronized](http://jnb.ociweb.com/jnb/jnbJan2010.html#synchronized)
  - [@SneakyThrows](http://jnb.ociweb.com/jnb/jnbJan2010.html#sneaky)
- Costs and Benefits
  - [What are we missing?](http://jnb.ociweb.com/jnb/jnbJan2010.html#whatsmissing)
  - [Limitations](http://jnb.ociweb.com/jnb/jnbJan2010.html#limitations)
  - [Controversy](http://jnb.ociweb.com/jnb/jnbJan2010.html#controversy)
- [Summary](http://jnb.ociweb.com/jnb/jnbJan2010.html#summary)
- [References](http://jnb.ociweb.com/jnb/jnbJan2010.html#references)

**详情：**

## Introduction

"Boilerplate" is a term used to describe code that is repeated in many parts of an application with little alteration. One of the most frequently voiced criticisms of the Java language is the volume of this type of code that is found in most projects. This problem is frequently a result of design decisions in various libraries, but is exacerbated by limitations in the language itself. Project Lombok aims to reduce the prevalence of some of the worst offenders by replacing them with a simple set of annotations.

While it is not uncommon for annotations to be used to indicate usage, to implement bindings or even to generate code used by frameworks, they are generally not used for the generation of code that is directly utilized by the application. This is partly because doing so would require that the annotations be eagerly processed at development time. Project Lombok does just that. By integrating into the IDE, Project Lombok is able to inject code that is immediately available to the developer. For example, simply adding the `@Data` annotation to a data class, as below, results in a number of new methods in the IDE:

![Image illustrating the availability of new methods on a data class in Eclipse.](http://jnb.ociweb.com/jnb/jnbJan2010_files/jnbJan2010-DataAnnotation.png)

## Installation

Project Lombok is available as a single jar file on the [project site](http://projectlombok.org/). It includes the APIs for development as an installer for IDE integration. On most systems, simply double-clicking the jar file will launch the installer. If the system is not configured to correctly launch jar files, it can also be run from the command line as follows:

```
java -jar lombok.jar
```

The installer will attempt to detect the location of a supported IDE. If it cannot correctly determine where the IDE is installed, the location can be specified manually. Simply click "Install/Update" and IDE integration is complete. At the time of this article's writing, only Eclipse and NetBeans are supported. However, the release of the IntelliJ IDEA source code has placed IDEA support as a possibility for future releases, and limited success has already been reported with JDeveloper.

![Screenshot of the Lombok Installer](http://jnb.ociweb.com/jnb/jnbJan2010_files/jnbJan2010-LombokInstaller.png)

The jar file will still need to be included in the classpath of any projects that will use Project Lombok annotations. Maven users can include Lombok as a dependency by adding this to the project pom.xml file:

```
<dependencies>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>0.9.2</version>
    </dependency>
</dependencies>
<repositories>
    <repository>
        <id>projectlombok.org</id>
        <url>http://projectlombok.org/mavenrepo</url>
    </repository>
</repositories>
```

## Lombok Annotations

It is not uncommon for a typical Java project to devote hundreds of lines of code to the boilerplate required for defining simple data classes. These classes generally contain a number of fields, getters and setters for those fields, as well as `equals` and `hashCode` implementations. In the simplest scenarios, Project Lombok can reduce these classes to the required fields and a single `@Data` annotation.

Of course, the simplest scenarios are not necessarily the ones that developers face on a day-to-day basis. For that reason, there are a number of annotations in Project Lombok to allow for more fine grained control over the structure and behavior of a class.

### @Getter and @Setter

The `@Getter` and `@Setter` annotations generate a getter and setter for a field, respectively. The getters generated correctly follow convention for boolean properties, resulting in an `isFoo` getter method name instead of `getFoo`for any `boolean` field `foo`. It should be noted that if the class to which the annotated field belongs contains a method of the same name as the getter or setter to be generated, regardless of parameter or return types, no corresponding method will be generated.

Both the `@Getter` and `@Setter` annotations take an optional parameter to specify the access level for the generated method.

Lombok annotated code:

```
@Getter @Setter private boolean employed = true;
@Setter(AccessLevel.PROTECTED) private String name;
```

Equivalent Java source code:

```
private boolean employed = true;
private String name;

public boolean isEmployed() {
    return employed;
}

public void setEmployed(final boolean employed) {
    this.employed = employed;
}

protected void setName(final String name) {
    this.name = name;
}
```

### @NonNull

The `@NonNull` annotation is used to indicate the need for a fast-fail null check on the corresponding member. When placed on a field for which Lombok is generating a setter method, a null check will be generated that will result in a `NullPointerException` should a null value be provided. Additionally, if Lombok is generating a constructor for the owning class then the field will be added to the constructor signature and the null check will be included in the generated constructor code.

This annotation mirrors `@NotNull` and `@NonNull` annotations found in IntelliJ IDEA and FindBugs, among others. Lombok is annotation agnostic with regards to these variations on the theme. If Lombok comes across any member annotated with any annotation of the name `@NotNull` or `@NonNull`, it will honor it by generating the appropriate corresponding code. The authors of Project Lombok further comment that, in the event that annotation of this type is added to Java, then the Lombok version will be subject to removal.

Lombok annotated code from the class `Family`:

```
@Getter @Setter @NonNull
private List<Person> members;
```

Equivalent Java source code:

```
@NonNull
private List<Person> members;

public Family(@NonNull final List<Person> members) {
    if (members == null) throw new java.lang.NullPointerException("members");
    this.members = members;
}

@NonNull
public List<Person> getMembers() {
    return members;
}

public void setMembers(@NonNull final List<Person> members) {
    if (members == null) throw new java.lang.NullPointerException("members");
    this.members = members;
}
```

### @ToString

This annotation generates an implementation of the `toString` method. By default, any non-static fields will be included in the output of the method in name-value pairs. If desired, the inclusion of the property names in the output can be suppressed by setting the annotation parameter `includeFieldNames` to `false`.

Specific fields can be excluded from the output of the generated method by including their field names in the `exclude` parameter. Alternatively, the `of` parameter can be used to list only those fields which are desired in the output. The output of the `toString` method of a superclass can also be included by setting the `callSuper` parameter to `true`.

Lombok annotated code:

```
@ToString(callSuper=true,exclude="someExcludedField")
public class Foo extends Bar {
    private boolean someBoolean = true;
    private String someStringField;
    private float someExcludedField;
}
```

Equivalent Java source code:

```
public class Foo extends Bar {
    private boolean someBoolean = true;
    private String someStringField;
    private float someExcludedField;

    @java.lang.Override
    public java.lang.String toString() {
        return "Foo(super=" + super.toString() +
            ", someBoolean=" + someBoolean +
            ", someStringField=" + someStringField + ")";
    }
}
```

### @EqualsAndHashCode

This class level annotation will cause Lombok to generate both `equals` and `hashCode` methods, as the two are tied together intrinsically by the `hashCode` contract. By default, any field in the class that is not static or transient will be considered by both methods. Much like `@ToString`, the `exclude` parameter is provided to prevent field from being included in the generated logic. One can also use the `of` parameter to list only those fields should be considered.

Also like `@ToString`, there is a `callSuper` parameter for this annotation. Setting it to true will cause `equals` to verify equality by calling the `equals` from the superclass before considering fields in the current class. For the`hashCode` method, it results in the incorporation of the results of the superclass's `hashCode` in the calculation of the hash. When setting `callSuper` to true, be careful to make sure that the equals method in the parent class properly handles instance type checking. If the parent class checks that the class is of a specific type and not merely that the classes of the two objects are the same, this can result in undesired results. If the superclass is using a Lombok generated `equals` method, this is not an issue. However, other implementations may not handle this situation correctly. Also note that setting `callSuper` to true cannot be done when the class only extends `Object`, as it would result in an instance equality check that short-circuits the comparison of fields. This is due to the generated method calling the `equals` implementation on `Object`, which returns false if the two instances being compared are not the same instance. As a result, Lombok will generate a compile time error in this situation.

Lombok annotated code:

```
@EqualsAndHashCode(callSuper=true,exclude={"address","city","state","zip"})
public class Person extends SentientBeing {
    enum Gender { Male, Female }

    @NonNull private String name;
    @NonNull private Gender gender;

    private String ssn;
    private String address;
    private String city;
    private String state;
    private String zip;
}
```

Equivalent Java source code:

```
public class Person extends SentientBeing {

    enum Gender {
        /*public static final*/ Male /* = new Gender() */,
        /*public static final*/ Female /* = new Gender() */;
    }
    @NonNull
    private String name;
    @NonNull
    private Gender gender;
    private String ssn;
    private String address;
    private String city;
    private String state;
    private String zip;

    @java.lang.Override
    public boolean equals(final java.lang.Object o) {
        if (o == this) return true;
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        if (!super.equals(o)) return false;
        final Person other = (Person)o;
        if (this.name == null ? other.name != null : !this.name.equals(other.name)) return false;
        if (this.gender == null ? other.gender != null : !this.gender.equals(other.gender)) return false;
        if (this.ssn == null ? other.ssn != null : !this.ssn.equals(other.ssn)) return false;
        return true;
    }

    @java.lang.Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = result * PRIME + super.hashCode();
        result = result * PRIME + (this.name == null ? 0 : this.name.hashCode());
        result = result * PRIME + (this.gender == null ? 0 : this.gender.hashCode());
        result = result * PRIME + (this.ssn == null ? 0 : this.ssn.hashCode());
        return result;
    }
}
```

### @Data

The `@Data` annotation is likely the most frequently used annotation in the Project Lombok toolset. It combines the functionality of `@ToString`, `@EqualsAndHashCode`, `@Getter` and `@Setter`. Essentially, using `@Data` on a class is the same as annotating the class with a default `@ToString` and `@EqualsAndHashCode` as well as annotating each field with both `@Getter` and `@Setter`. Annotation a class with `@Data` also triggers Lombok's constructor generation. This adds a public constructor that takes any `@NonNull` or `final` fields as parameters. This provides everything needed for a Plain Old Java Object (POJO).

While `@Data` is extremely useful, it does not provide the same granularity of control as the other Lombok annotations. In order to override the default method generation behaviors, annotate the class, field or method with one of the other Lombok annotations and specify the necessary parameter values to achieve the desired effect.

`@Data` does provide a single parameter option that can be used to generate a static factory method. Setting the value of the `staticConstructor` parameter to the desired method name will cause Lombok to make the generated constructor private and expose a a static factory method of the given name.

Lombok annotated code:

```
@Data(staticConstructor="of")
public class Company {
    private final Person founder;
    private String name;
    private List<Person> employees;
}
```

Equivalent Java source code:

```
public class Company {
    private final Person founder;
    private String name;
    private List<Person> employees;

    private Company(final Person founder) {
        this.founder = founder;
    }

    public static Company of(final Person founder) {
        return new Company(founder);
    }

    public Person getFounder() {
        return founder;
    }

    public String getName() {
        return name;
    }

    public void setName(final String name) {
        this.name = name;
    }

    public List<Person> getEmployees() {
        return employees;
    }

    public void setEmployees(final List<Person> employees) {
        this.employees = employees;
    }

    @java.lang.Override
    public boolean equals(final java.lang.Object o) {
        if (o == this) return true;
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        final Company other = (Company)o;
        if (this.founder == null ? other.founder != null : !this.founder.equals(other.founder)) return false;
        if (this.name == null ? other.name != null : !this.name.equals(other.name)) return false;
        if (this.employees == null ? other.employees != null : !this.employees.equals(other.employees)) return false;
        return true;
    }

    @java.lang.Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = result * PRIME + (this.founder == null ? 0 : this.founder.hashCode());
        result = result * PRIME + (this.name == null ? 0 : this.name.hashCode());
        result = result * PRIME + (this.employees == null ? 0 : this.employees.hashCode());
        return result;
    }

    @java.lang.Override
    public java.lang.String toString() {
        return "Company(founder=" + founder + ", name=" + name + ", employees=" + employees + ")";
    }
}
```

### @Cleanup

The `@Cleanup` annotation can be used to ensure that allocated resources are released. When a local variable is annotated with `@Cleanup`, any subsequent code is wrapped in a `try/finally` block that guarantees that the cleanup method is called at the end of the current scope. By default `@Cleanup` assumes that the cleanup method is named "close", as with input and output streams. However, a different method name can be provided to the annotation's`value` parameter. Only cleanup methods which take no parameters are able to be used with this annotation.

There is also a caveat to consider when using the @Cleanup annotation. In the event that an exception is thrown by the cleanup method, it will preempt any exception that was thrown in the method body. This can result in the actual cause of an issue being buried and should be considered when choosing to use Project Lombok's resource management. Furthermore, with automatic resource management on the horizon in Java 7, this particular annotation is likely to be relatively short-lived.

Lombok annotated code:

```
public void testCleanUp() {
    try {
        @Cleanup ByteArrayOutputStream baos = new ByteArrayOutputStream();
        baos.write(new byte[] {'Y','e','s'});
        System.out.println(baos.toString());
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

Equivalent Java source code:

```
public void testCleanUp() {
    try {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            baos.write(new byte[]{'Y', 'e', 's'});
            System.out.println(baos.toString());
        } finally {
            baos.close();
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

### @Synchronized

Using the `synchronized` keyword on a method can result in unfortunate effects, as any developer who has worked on multi-threaded software can attest. The synchronized keyword will lock on the current object (`this`) in the case of an instance method or on the `class` object for a static method. This means that there is the potential for code outside of the control of the developer to lock on the same object, resulting in a deadlock. It is generally advisable to instead lock explicitly on a separate object that is dedicated solely to that purpose and not exposed in such a way as to allow unsolicited locking. Project Lombok provides the `@Synchronized` annotation for that very purpose.

Annotating an instance method with `@Synchronized` will prompt Lombok to generate a private locking field named `$lock` on which the method will lock prior to executing. Similarly, annotating a static method in the same way will generate a private static object named `$LOCK` for the static method to use in an identical fashion. A different locking object can be specified by providing a field name to the annotation's `value` parameter. When a field name is provided, the developer must define the property as Lombok will not generate it.

Lombok annotated code:

```
private DateFormat format = new SimpleDateFormat("MM-dd-YYYY");

@Synchronized
public String synchronizedFormat(Date date) {
    return format.format(date);
}
```

Equivalent Java source code:

```
private final java.lang.Object $lock = new java.lang.Object[0];
private DateFormat format = new SimpleDateFormat("MM-dd-YYYY");

public String synchronizedFormat(Date date) {
    synchronized ($lock) {
        return format.format(date);
    }
}
```

### @SneakyThrows

`@SneakyThrows` is probably the Project Lombok annotation with the most detractors, since it is a direct assault on checked exceptions. There is a lot of disagreement with regards to the use of checked exceptions, with a large number of developers holding that they are a failed experiment. These developers will love `@SneakyThrows`. Those developers on the other side of the checked/unchecked exception fence will most likely view this as hiding potential problems.

Throwing `IllegalAccessException` would normally generate an "Unhandled exception" error if `IllegalAccessException`, or some parent class, is not listed in a throws clause:

![Screenshot of Eclipse generating an error message regarding unhandled exceptions.](http://jnb.ociweb.com/jnb/jnbJan2010_files/jnbJan2010-UnhandledException.png)

When annotated with `@SneakyThrows`, the error goes away.

![Screenshot of a method annotated with @SneakyThrows and generating no error in Eclipse.](http://jnb.ociweb.com/jnb/jnbJan2010_files/jnbJan2010-SneakyThrows.png)

By default, `@SneakyThrows` will allow any checked exception to be thrown without declaring in the `throws` clause. This can be limited to a particular set of exceptions by providing an array of throwable classes ( `Class<? extends Throwable>`) to the `value` parameter of the annotation.

Lombok annotated code:

```
@SneakyThrows
public void testSneakyThrows() {
    throw new IllegalAccessException();
}
```

Equivalent Java source code:

```
public void testSneakyThrows() {
    try {
        throw new IllegalAccessException();
    } catch (java.lang.Throwable $ex) {
        throw lombok.Lombok.sneakyThrow($ex);
    }
}
```

A look at the above code and the signature of `Lombok.sneakyThrow(Throwable)` would lead most to believe that the exception is being wrapped in a `RuntimeException` and re-thrown, however this is not the case. The`sneakyThrow` method will never return normally and will instead throw the provided throwable completely unaltered.

## Costs and Benefits

As with any technology choice, there are both positive and negative effects of using Project Lombok. Incorporating Lombok's annotations in a project can greatly reduce the number of lines of boilerplate code that are either generated in the IDE or written by hand. This results in reduced maintenance overhead, fewer bugs and more readable classes.

That is not to say that there are not downsides to using Project Lombok annotations in your project. Project Lombok is largely aimed at filling gaps in the Java language. As such, there is the possibility that changes to the language will take place that preclude the use of Lombok's annotations, such as the addition of first class property support. Additionally, when used in combination with annotation-based object-relational mapping (ORM) frameworks, the number of annotations on data classes can begin to get unwieldy. This is largely offset by the amount of code that is superseded by the Lombok annotations. However, those who shun the frequent use of annotations may choose to look the other way.

### What is missing?

Project Lombok provides the `delombok` utility for replacing the Lombok annotations with equivalent source code. This can be done for an entire source directory via the command line.

```
java -jar lombok.jar delombok src -d src-delomboked
```

Alternatively, an Ant task is provided for incorporation into a build process.

```
<target name="delombok">
    <taskdef classname="lombok.delombok.ant.DelombokTask"
        classpath="WebRoot/WEB-INF/lib/lombok.jar" name="delombok" />
    <mkdir dir="src-delomboked" />
    <delombok verbose="true" encoding="UTF-8" to="src-delomboked"
        from="src" />
</target>
```

Both `delombok` and the corresponding Ant task come packaged in the core `lombok.jar` download. Along with allowing Lombok annotations to be useful in applications built using Google Web Toolkit (GWT) or other incompatible frameworks, running `delombok` on the `Person` class makes it easy to contrast the class as written using the Lombok annotations against code that includes the equivalent boilerplate inline.

```
package com.ociweb.jnb.lombok;

import java.util.Date;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NonNull;

@Data
@EqualsAndHashCode(exclude={"address","city","state","zip"})
public class Person {
    enum Gender { Male, Female }

    @NonNull private String firstName;
    @NonNull private String lastName;
    @NonNull private final Gender gender;
    @NonNull private final Date dateOfBirth;

    private String ssn;
    private String address;
    private String city;
    private String state;
    private String zip;
}
```

The code utilizing the Project Lombok annotations is significantly more concise than the equivalent class with the boilerplate included.

```
package com.ociweb.jnb.lombok;

import java.util.Date;
import lombok.NonNull;

public class Person {

    enum Gender {
        /*public static final*/ Male /* = new Gender() */,
        /*public static final*/ Female /* = new Gender() */;
    }
    @NonNull
    private String firstName;
    @NonNull
    private String lastName;
    @NonNull
    private final Gender gender;
    @NonNull
    private final Date dateOfBirth;
    private String ssn;
    private String address;
    private String city;
    private String state;
    private String zip;

    public Person(@NonNull final String firstName, @NonNull final String lastName,
            @NonNull final Gender gender, @NonNull final Date dateOfBirth) {
        if (firstName == null)
            throw new java.lang.NullPointerException("firstName");
        if (lastName == null)
            throw new java.lang.NullPointerException("lastName");
        if (gender == null)
            throw new java.lang.NullPointerException("gender");
        if (dateOfBirth == null)
            throw new java.lang.NullPointerException("dateOfBirth");
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
        this.dateOfBirth = dateOfBirth;
    }

    @NonNull
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(@NonNull final String firstName) {
        if (firstName == null)
            throw new java.lang.NullPointerException("firstName");
        this.firstName = firstName;
    }

    @NonNull
    public String getLastName() {
        return lastName;
    }

    public void setLastName(@NonNull final String lastName) {
        if (lastName == null)
            throw new java.lang.NullPointerException("lastName");
        this.lastName = lastName;
    }

    @NonNull
    public Gender getGender() {
        return gender;
    }

    @NonNull
    public Date getDateOfBirth() {
        return dateOfBirth;
    }

    public String getSsn() {
        return ssn;
    }

    public void setSsn(final String ssn) {
        this.ssn = ssn;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(final String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(final String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(final String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(final String zip) {
        this.zip = zip;
    }

    @java.lang.Override
    public java.lang.String toString() {
        return "Person(firstName=" + firstName + ", lastName=" + lastName +
            ", gender=" + gender + ", dateOfBirth=" + dateOfBirth +
            ", ssn=" + ssn + ", address=" + address + ", city=" + city +
            ", state=" + state + ", zip=" + zip + ")";
    }

    @java.lang.Override
    public boolean equals(final java.lang.Object o) {
        if (o == this) return true;
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        final Person other = (Person)o;
        if (this.firstName == null
                ? other.firstName != null
                : !this.firstName.equals(other.firstName))
            return false;
        if (this.lastName == null
                ? other.lastName != null
                : !this.lastName.equals(other.lastName))
            return false;
        if (this.gender == null
                ? other.gender != null
                : !this.gender.equals(other.gender))
            return false;
        if (this.dateOfBirth == null
                ? other.dateOfBirth != null
                : !this.dateOfBirth.equals(other.dateOfBirth))
            return false;
        if (this.ssn == null
                ? other.ssn != null
                : !this.ssn.equals(other.ssn))
            return false;
        return true;
    }

    @java.lang.Override
    public int hashCode() {
        final int PRIME = 31;
        int result = 1;
        result = result * PRIME +
            (this.firstName == null ? 0 : this.firstName.hashCode());
        result = result * PRIME +
            (this.lastName == null ? 0 : this.lastName.hashCode());
        result = result * PRIME +
            (this.gender == null ? 0 : this.gender.hashCode());
        result = result * PRIME +
            (this.dateOfBirth == null ? 0 : this.dateOfBirth.hashCode());
        result = result * PRIME +
            (this.ssn == null ? 0 : this.ssn.hashCode());
        return result;
    }
}
```

Keep in mind that this is not just code that normally has to be written, but must also be read by maintaining developers. This means that, when using the annotations provided by Project Lombok, developers do not have to wade through countless lines of code in order to determine if the class in question is a simple data class or something more sinister.

### Limitations

While Project Lombok does some dramatic things to make a developer's life easier, it has its limitations. Browsing the [issues list](http://code.google.com/p/projectlombok/issues/list) will quickly illuminate some of the current shortcomings, most of which are minor. One important problem is the inability to detect the constructors of a superclass. This means that if a superclass has no default constructor any subclasses cannot use the @Data annotation without explicitly writing a constructor to make use of the available superclass constructor. Since Project Lombok respects any methods that match the name of a method to be generated, the majority of its feature shortcomings can be overcome using this approach.

### Controversy

A number of issues have been raised against the use of Project Lombok. The most common argument holds that annotations were intended for "meta" information and are not to be used in such a way that would leave the codebase unable to be compiled were they removed. This is certainly the situation with Lombok annotations. New methods result from these annotations that are intended to be used not only by a framework, but by other parts of the application. Project Lombok's development-time support is its bread and butter, but this does have consequences, not the least of which is limited IDE support.

As previously stated, `@SneakyThrows` is bound to stir up the age-old argument over checked and unchecked exceptions. Opinions on this debate are often almost religious in their ferocity. As such, the arguments against the use of `@SneakyThrows` are also sure to excite fervor among the passionate.

Another point of contention is the implementation of both the code supporting IDE integration as well as the `javac` annotation processor. Both of these pieces of Project Lombok make use of non-public APIs to accomplish their sorcery. This means that there is a risk that Project Lombok will be broken with subsequent IDE or JDK releases. Here is how one of the project founders, Reinier Zwitserloot described the situation:

```
It's a total hack. Using non-public API. Presumptuous casting (knowing that an
annotation processor running in javac will get an instance of JavacAnnotationProcessor,
which is the internal implementation of AnnotationProcessor (an interface), which
so happens to have a couple of extra methods that are used to get at the live AST).

On eclipse, it's arguably worse (and yet more robust) - a java agent is used to inject
code into the eclipse grammar and parser class, which is of course entirely non-public
API and totally off limits.

If you could do what lombok does with standard API, I would have done it that way, but
you can't. Still, for what its worth, I developed the eclipse plugin for eclipse v3.5
running on java 1.6, and without making any changes it worked on eclipse v3.4 running
on java 1.5 as well, so it's not completely fragile.
```

## Summary

Project Lombok is a powerful tool for the pragmatic developer. It provides a set of useful annotations for eliminating a tremendous amount of boilerplate code from your Java classes. In the best cases, a mere five characters can replace hundreds of lines of code. The result is Java classes that are clean, concise and easy to maintain. These benefits do come with a cost however. Using Project Lombok in an IntelliJ IDEA shop is simply not yet a viable option. There is a risk of breakage with IDE and JDK upgrades as well as controversy surrounding the goals and implementation of the project. What all this translates to is no different than what must be considered for any technology choice. There are always gains to be made and losses to be had. The question is simply whether or not Project Lombok can provide more value than cost for the project at hand. If nothing else, Project Lombok is sure to inject some new life into the discussion of language features that have withered on the vine thus far and that is a win from any perspective.

## References

- Project Lombok -
  [http://projectlombok.org](http://projectlombok.org/)
- Lombok API Documentation -
  http://projectlombok.org/api/index.html
- Project Lombok Issues List -
  http://code.google.com/p/projectlombok/issues/list
- Use Lombok via Maven -
  http://projectlombok.org/mavenrepo/index.html
- Project Lombok Google Group -
  http://groups.google.com/group/project-lombok
- Reviewing Project Lombok or the Right Way to Write a Library -
  http://www.cforcoding.com/2009/11/reviewing-project-lombok-or-right-way.html
- Morbok: Extensions for Lombok -
  [http://code.google.com/p/morbok](http://code.google.com/p/morbok/)
- Using Project Lombok with JDeveloper -
  http://kingsfleet.blogspot.com/2009/09/project-lombok-interesting-bean.html
- Example Code -
  [LombokExample.zip](http://jnb.ociweb.com/jnb/jnbJan2010_files/LombokExample.zip)

Thanks to Mark Volkmann, Eric Burke, Mario Aquino and Lance Finney for reviewing and providing suggestions for this article, and a special thanks to Mark Volkmann for introducing me to Project Lombok.

http://jnb.ociweb.com/jnb/jnbJan2010.html
